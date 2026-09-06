import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import {
  IncidentStatus,
  Priority,
  Role,
  ActivityAction,
  NotificationType,
  IncidentFilters,
  PaginationQuery,
} from '../types';
import { generateIncidentNumber } from '../utils/requestNumber';
import { createNotification, createNotifications } from './notification.service';
import { logAudit } from './audit.service';

// ─── SLA Hours by Priority ──────────────────────────────────────────────────
export const PRIORITY_SLA_HOURS: Record<Priority, number> = {
  CRITICAL: 1,      // 1 hour
  HIGH: 4,          // 4 hours
  MEDIUM: 24,       // 1 business day (24h)
  LOW: 72,          // 3 business days (72h)
};

// ─── Allowed Status Transitions ──────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: [IncidentStatus.ASSIGNED, IncidentStatus.CLOSED],
  ASSIGNED: [IncidentStatus.IN_PROGRESS, IncidentStatus.WAITING_FOR_INFO, IncidentStatus.ASSIGNED],
  IN_PROGRESS: [IncidentStatus.WAITING_FOR_INFO, IncidentStatus.RESOLVED, IncidentStatus.ASSIGNED],
  WAITING_FOR_INFO: [IncidentStatus.IN_PROGRESS, IncidentStatus.RESOLVED],
  RESOLVED: [IncidentStatus.CLOSED, IncidentStatus.REOPENED],
  REOPENED: [IncidentStatus.IN_PROGRESS, IncidentStatus.ASSIGNED, IncidentStatus.RESOLVED],
  CLOSED: [],
};

function assertTransition(from: IncidentStatus, to: IncidentStatus) {
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    throw new AppError(`Cannot transition incident from ${from} to ${to}`, 400);
  }
}

// ─── Incident Select ────────────────────────────────────────────────────────
const INCIDENT_SELECT = {
  id: true,
  incidentNumber: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  slaDeadline: true,
  slaBreached: true,
  rootCause: true,
  resolution: true,
  reportedAt: true,
  assignedAt: true,
  resolvedAt: true,
  closedAt: true,
  reopenedAt: true,
  createdAt: true,
  updatedAt: true,
  branch: {
    select: {
      id: true,
      name: true,
      code: true,
      location: true,
      phone: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      division: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
  reportedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  assignedTechnician: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      division: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
};

// ─── Create Incident ─────────────────────────────────────────────────────────
export async function createIncident(data: {
  branchId: string;
  categoryId: string;
  title: string;
  description: string;
  reportedById: string;
  priority?: Priority;
}) {
  const branch = await prisma.branch.findUnique({
    where: { id: data.branchId, isActive: true },
  });
  if (!branch) throw new AppError('Branch not found or inactive', 400);

  const category = await prisma.incidentCategory.findUnique({
    where: { id: data.categoryId, isActive: true },
    include: { division: true },
  });
  if (!category) throw new AppError('Category not found or inactive', 400);

  const priority = data.priority || category.defaultPriority || Priority.MEDIUM;
  const slaHours = PRIORITY_SLA_HOURS[priority] ?? category.defaultSlaHours ?? 24;
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  const incidentNumber = await generateIncidentNumber();

  const incident = await prisma.incident.create({
    data: {
      incidentNumber,
      title: data.title,
      description: data.description,
      branchId: data.branchId,
      categoryId: data.categoryId,
      reportedById: data.reportedById,
      priority,
      status: IncidentStatus.OPEN,
      slaDeadline,
    },
    select: INCIDENT_SELECT,
  });

  // Record creation update
  await prisma.incidentUpdate.create({
    data: {
      incidentId: incident.id,
      userId: data.reportedById,
      action: ActivityAction.INCIDENT_CREATED,
      message: `Incident reported from ${branch.name} for category "${category.name}".`,
    },
  });

  await logAudit({
    userId: data.reportedById,
    action: 'INCIDENT_CREATED',
    entityType: 'Incident',
    entityId: incident.id,
    newValue: { incidentNumber: incident.incidentNumber, title: incident.title, priority: incident.priority, branchId: data.branchId },
  });

  // Notify supervisors
  const supervisors = await prisma.user.findMany({
    where: { role: Role.IT_SUPERVISOR, isActive: true },
    select: { id: true },
  });

  if (supervisors.length > 0) {
    await createNotifications(
      supervisors.map((s) => ({
        userId: s.id,
        incidentId: incident.id,
        title: `New Incident: ${incident.incidentNumber}`,
        message: `${branch.name}: ${incident.title} (${incident.priority})`,
        type: NotificationType.INCIDENT_CREATED,
      }))
    );
  }

  return incident;
}

// ─── Get Incidents with Filtering & Pagination ──────────────────────────────
export async function getIncidents(
  filters: IncidentFilters,
  pagination: PaginationQuery,
  currentUser: { userId: string; role: Role; branchId?: string | null; divisionId?: string | null }
) {
  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 20));
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {};

  // Role-based scoping
  if (currentUser.role === Role.BRANCH_USER) {
    if (currentUser.branchId) {
      where.branchId = currentUser.branchId;
    } else {
      where.reportedById = currentUser.userId;
    }
  } else if (currentUser.role === Role.TECHNICIAN) {
    // If technician wants to see only their assigned tickets
    if (filters.assignedTechnicianId === 'me' || filters.assignedTechnicianId === currentUser.userId) {
      where.assignedTechnicianId = currentUser.userId;
    } else if (filters.assignedTechnicianId) {
      where.assignedTechnicianId = filters.assignedTechnicianId;
    } else if (currentUser.divisionId) {
      // Default technician view shows their division tickets or their assigned tickets
      where.OR = [
        { assignedTechnicianId: currentUser.userId },
        { category: { divisionId: currentUser.divisionId } },
      ];
    }
  }

  // Filter overrides
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.branchId) where.branchId = filters.branchId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.slaBreached !== undefined) where.slaBreached = filters.slaBreached;

  if (filters.divisionId) {
    where.category = { divisionId: filters.divisionId };
  } else if (filters.divisionCode) {
    where.category = { division: { code: filters.divisionCode } };
  }

  if (filters.assignedTechnicianId && filters.assignedTechnicianId !== 'me') {
    where.assignedTechnicianId = filters.assignedTechnicianId;
  }

  if (filters.reportedById) {
    where.reportedById = filters.reportedById;
  }

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { incidentNumber: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { branch: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      select: INCIDENT_SELECT,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.incident.count({ where }),
  ]);

  return {
    incidents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Incident Details ───────────────────────────────────────────────────
export async function getIncidentById(
  id: string,
  currentUser: { userId: string; role: Role; branchId?: string | null }
) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      branch: true,
      category: {
        include: { division: true },
      },
      reportedBy: {
        select: { id: true, name: true, email: true, phone: true, role: true },
      },
      assignedTechnician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          division: true,
        },
      },
      updates: {
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      troubleshootingLogs: {
        include: {
          technician: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      attachments: {
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!incident) throw new AppError('Incident not found', 404);

  // Access check for Branch Users
  if (currentUser.role === Role.BRANCH_USER) {
    if (currentUser.branchId && incident.branchId !== currentUser.branchId) {
      if (incident.reportedById !== currentUser.userId) {
        throw new AppError('Access denied to incident from another branch', 403);
      }
    }
  }

  return incident;
}

// ─── Review Incident (Supervisor) ───────────────────────────────────────────
export async function reviewIncident(
  id: string,
  supervisorId: string,
  data: {
    priority?: Priority;
    categoryId?: string;
    notes?: string;
  }
) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!incident) throw new AppError('Incident not found', 404);

  const updateData: Record<string, unknown> = {};

  if (data.priority && data.priority !== incident.priority) {
    updateData.priority = data.priority;
    const slaHours = PRIORITY_SLA_HOURS[data.priority];
    updateData.slaDeadline = new Date(incident.createdAt.getTime() + slaHours * 60 * 60 * 1000);
  }

  if (data.categoryId && data.categoryId !== incident.categoryId) {
    const cat = await prisma.incidentCategory.findUnique({ where: { id: data.categoryId } });
    if (!cat) throw new AppError('Category not found', 400);
    updateData.categoryId = data.categoryId;
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: updateData,
    select: INCIDENT_SELECT,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: supervisorId,
      action: ActivityAction.INCIDENT_REVIEWED,
      message: data.notes || `Incident reviewed. Priority: ${updated.priority}`,
    },
  });

  return updated;
}

// ─── Assign Technician (Supervisor) ─────────────────────────────────────────
export async function assignTechnician(
  id: string,
  supervisorId: string,
  technicianId: string,
  notes?: string
) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new AppError('Incident not found', 404);

  const technician = await prisma.user.findUnique({
    where: { id: technicianId, role: Role.TECHNICIAN, isActive: true },
    include: { division: true },
  });
  if (!technician) throw new AppError('Active technician not found', 400);

  const isReassignment = !!incident.assignedTechnicianId;
  const newStatus = IncidentStatus.ASSIGNED;

  if (incident.status === IncidentStatus.OPEN) {
    assertTransition(incident.status, newStatus);
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: {
      assignedTechnicianId: technicianId,
      status: newStatus,
      assignedAt: new Date(),
    },
    select: INCIDENT_SELECT,
  });

  const action = isReassignment ? ActivityAction.INCIDENT_REASSIGNED : ActivityAction.INCIDENT_ASSIGNED;
  const actionText = isReassignment ? 'reassigned' : 'assigned';

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: supervisorId,
      action,
      message: notes || `Incident ${actionText} to ${technician.name}${technician.division ? ` (${technician.division.name} Division)` : ''}.`,
    },
  });

  await logAudit({
    userId: supervisorId,
    action: isReassignment ? 'INCIDENT_REASSIGNED' : 'INCIDENT_ASSIGNED',
    entityType: 'Incident',
    entityId: id,
    oldValue: { assignedTechnicianId: incident.assignedTechnicianId },
    newValue: { assignedTechnicianId: technicianId, notes },
  });

  // Notify technician
  await createNotification({
    userId: technicianId,
    incidentId: id,
    title: `Assigned: ${updated.incidentNumber}`,
    message: `You have been assigned to ${updated.incidentNumber}: ${updated.title}`,
    type: NotificationType.INCIDENT_ASSIGNED,
  });

  return updated;
}

// ─── Start Investigation (Technician) ───────────────────────────────────────
export async function startInvestigation(id: string, technicianId: string) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new AppError('Incident not found', 404);

  if (incident.assignedTechnicianId !== technicianId) {
    throw new AppError('Only the assigned technician can start investigation', 403);
  }

  assertTransition(incident.status, IncidentStatus.IN_PROGRESS);

  const updated = await prisma.incident.update({
    where: { id },
    data: { status: IncidentStatus.IN_PROGRESS },
    select: INCIDENT_SELECT,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: technicianId,
      action: ActivityAction.INVESTIGATION_STARTED,
      message: 'Technician has started active troubleshooting and investigation.',
    },
  });

  // Notify Branch User
  await createNotification({
    userId: incident.reportedById,
    incidentId: id,
    title: `Investigation Started: ${incident.incidentNumber}`,
    message: `A technician is actively investigating your request.`,
    type: NotificationType.STATUS_CHANGED,
  });

  return updated;
}

// ─── Request More Info (Technician) ─────────────────────────────────────────
export async function requestMoreInfo(id: string, technicianId: string, question: string) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new AppError('Incident not found', 404);

  if (incident.assignedTechnicianId !== technicianId) {
    throw new AppError('Only the assigned technician can request info', 403);
  }

  assertTransition(incident.status, IncidentStatus.WAITING_FOR_INFO);

  const updated = await prisma.incident.update({
    where: { id },
    data: { status: IncidentStatus.WAITING_FOR_INFO },
    select: INCIDENT_SELECT,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: technicianId,
      action: ActivityAction.INFO_REQUESTED,
      message: question,
    },
  });

  await createNotification({
    userId: incident.reportedById,
    incidentId: id,
    title: `Action Required: Info Needed for ${incident.incidentNumber}`,
    message: `Technician: "${question}"`,
    type: NotificationType.INFO_REQUESTED,
  });

  return updated;
}

// ─── Provide More Info (Branch User) ────────────────────────────────────────
export async function provideMoreInfo(id: string, branchUserId: string, response: string) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new AppError('Incident not found', 404);

  if (incident.reportedById !== branchUserId) {
    throw new AppError('Only the reporter can provide info', 403);
  }

  assertTransition(incident.status, IncidentStatus.IN_PROGRESS);

  const updated = await prisma.incident.update({
    where: { id },
    data: { status: IncidentStatus.IN_PROGRESS },
    select: INCIDENT_SELECT,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: branchUserId,
      action: ActivityAction.INFO_PROVIDED,
      message: response,
    },
  });

  if (incident.assignedTechnicianId) {
    await createNotification({
      userId: incident.assignedTechnicianId,
      incidentId: id,
      title: `Info Provided: ${incident.incidentNumber}`,
      message: `Branch user replied: "${response}"`,
      type: NotificationType.INFO_PROVIDED,
    });
  }

  return updated;
}

// ─── Add Troubleshooting Log (Technician) ───────────────────────────────────
export async function addTroubleshootingLog(
  id: string,
  technicianId: string,
  data: { action: string; observation: string; result: string }
) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new AppError('Incident not found', 404);

  if (incident.assignedTechnicianId !== technicianId) {
    throw new AppError('Only the assigned technician can add troubleshooting logs', 403);
  }

  const log = await prisma.troubleshootingLog.create({
    data: {
      incidentId: id,
      technicianId,
      action: data.action,
      observation: data.observation,
      result: data.result,
    },
    include: {
      technician: { select: { id: true, name: true } },
    },
  });

  // Log in timeline
  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: technicianId,
      action: ActivityAction.TROUBLESHOOTING_ADDED,
      message: `Action: ${data.action} | Observation: ${data.observation} | Result: ${data.result}`,
    },
  });

  return log;
}

// ─── Resolve Incident (Technician) ──────────────────────────────────────────
export async function resolveIncident(
  id: string,
  technicianId: string,
  data: {
    rootCause: string;
    resolution: string;
    notes?: string;
  }
) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new AppError('Incident not found', 404);

  if (incident.assignedTechnicianId !== technicianId) {
    throw new AppError('Only the assigned technician can resolve this incident', 403);
  }

  if (!data.rootCause?.trim()) throw new AppError('Root cause is required', 400);
  if (!data.resolution?.trim()) throw new AppError('Resolution description is required', 400);

  assertTransition(incident.status, IncidentStatus.RESOLVED);

  const updated = await prisma.incident.update({
    where: { id },
    data: {
      status: IncidentStatus.RESOLVED,
      rootCause: data.rootCause.trim(),
      resolution: data.resolution.trim(),
      resolvedAt: new Date(),
    },
    select: INCIDENT_SELECT,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: technicianId,
      action: ActivityAction.RESOLVED,
      message: `Resolved. Root Cause: ${data.rootCause}. Resolution: ${data.resolution}${data.notes ? ` Notes: ${data.notes}` : ''}`,
    },
  });

  await logAudit({
    userId: technicianId,
    action: 'INCIDENT_RESOLVED',
    entityType: 'Incident',
    entityId: id,
    newValue: { rootCause: data.rootCause, resolution: data.resolution, notes: data.notes },
  });

  // Notify branch user to verify
  await createNotification({
    userId: incident.reportedById,
    incidentId: id,
    title: `Incident Resolved: ${incident.incidentNumber}`,
    message: `Your IT issue has been marked resolved. Please verify if the problem is solved.`,
    type: NotificationType.INCIDENT_RESOLVED,
  });

  return updated;
}

// ─── Verify Resolution (Branch User) ────────────────────────────────────────
export async function verifyResolution(
  id: string,
  branchUserId: string,
  data: {
    isResolved: boolean;
    feedback?: string;
  }
) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new AppError('Incident not found', 404);

  if (incident.status !== IncidentStatus.RESOLVED) {
    throw new AppError('Only resolved incidents can be verified', 400);
  }

  if (data.isResolved) {
    // Problem solved -> CLOSE
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        status: IncidentStatus.CLOSED,
        closedAt: new Date(),
      },
      select: INCIDENT_SELECT,
    });

    await prisma.incidentUpdate.create({
      data: {
        incidentId: id,
        userId: branchUserId,
        action: ActivityAction.VERIFIED_CLOSED,
        message: data.feedback || 'Branch confirmed problem is fully solved. Incident closed.',
      },
    });

    await logAudit({
      userId: branchUserId,
      action: 'INCIDENT_VERIFIED_CLOSED',
      entityType: 'Incident',
      entityId: id,
      newValue: { feedback: data.feedback },
    });

    if (incident.assignedTechnicianId) {
      await createNotification({
        userId: incident.assignedTechnicianId,
        incidentId: id,
        title: `Closed & Verified: ${incident.incidentNumber}`,
        message: `Branch verified resolution for ${incident.incidentNumber}.`,
        type: NotificationType.INCIDENT_CLOSED,
      });
    }

    return updated;
  } else {
    // Problem still exists -> REOPEN
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        status: IncidentStatus.IN_PROGRESS,
        reopenedAt: new Date(),
      },
      select: INCIDENT_SELECT,
    });

    await prisma.incidentUpdate.create({
      data: {
        incidentId: id,
        userId: branchUserId,
        action: ActivityAction.REOPENED,
        message: `Branch rejected resolution: Problem still exists. Feedback: ${data.feedback || 'Not resolved.'}`,
      },
    });

    // Notify technician & supervisors
    if (incident.assignedTechnicianId) {
      await createNotification({
        userId: incident.assignedTechnicianId,
        incidentId: id,
        title: `Reopened: ${incident.incidentNumber}`,
        message: `Branch reported problem still exists: "${data.feedback || 'Further troubleshooting required'}"`,
        type: NotificationType.INCIDENT_REOPENED,
      });
    }

    return updated;
  }
}

// ─── Add Note / Update ──────────────────────────────────────────────────────
export async function addIncidentNote(
  id: string,
  userId: string,
  message: string,
  isInternal = false
) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new AppError('Incident not found', 404);

  return prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId,
      action: ActivityAction.NOTE_ADDED,
      message: message.trim(),
      isInternal,
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
  });
}

// ─── SLA Breach Monitor (Cron) ──────────────────────────────────────────────
export async function checkSlaBreaches(): Promise<number> {
  const now = new Date();

  const overdueIncidents = await prisma.incident.findMany({
    where: {
      slaBreached: false,
      status: {
        in: [
          IncidentStatus.OPEN,
          IncidentStatus.ASSIGNED,
          IncidentStatus.IN_PROGRESS,
          IncidentStatus.WAITING_FOR_INFO,
        ],
      },
      slaDeadline: { lt: now },
    },
    include: {
      branch: true,
      assignedTechnician: true,
    },
  });

  if (overdueIncidents.length === 0) return 0;

  const supervisors = await prisma.user.findMany({
    where: { role: Role.IT_SUPERVISOR, isActive: true },
    select: { id: true },
  });

  for (const incident of overdueIncidents) {
    await prisma.incident.update({
      where: { id: incident.id },
      data: { slaBreached: true },
    });

    await prisma.incidentUpdate.create({
      data: {
        incidentId: incident.id,
        userId: supervisors[0]?.id || incident.reportedById,
        action: ActivityAction.SLA_BREACHED,
        message: `SLA Deadline (${incident.slaDeadline.toISOString()}) breached! Alert escalated to IT supervisor.`,
      },
    });

    // Notify supervisors
    if (supervisors.length > 0) {
      await createNotifications(
        supervisors.map((s) => ({
          userId: s.id,
          incidentId: incident.id,
          title: `🔴 SLA Breached: ${incident.incidentNumber}`,
          message: `${incident.branch.name}: ${incident.title} has exceeded SLA deadline!`,
          type: NotificationType.SLA_BREACHED,
        }))
      );
    }
  }

  return overdueIncidents.length;
}


// ─── Reclassify Incident Category & Division ──────────────────────────────
export async function reclassifyIncident(
  id: string,
  userId: string,
  data: { categoryId: string; notes?: string }
) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: { category: { include: { division: true } } },
  });
  if (!incident) throw new AppError('Incident not found', 404);

  const newCategory = await prisma.incidentCategory.findUnique({
    where: { id: data.categoryId },
    include: { division: true },
  });
  if (!newCategory) throw new AppError('Target category not found', 400);

  const oldCategoryName = incident.category.name;
  const oldDivisionName = incident.category.division.name;

  const updated = await prisma.incident.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
    },
    select: INCIDENT_SELECT,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId,
      action: ActivityAction.STATUS_CHANGED,
      message: `Incident reclassified from [${oldDivisionName} - ${oldCategoryName}] to [${newCategory.division.name} - ${newCategory.name}]. ${data.notes ? `Reason: ${data.notes}` : ''}`,
    },
  });

  await logAudit({
    userId,
    action: 'INCIDENT_RECLASSIFIED',
    entityType: 'Incident',
    entityId: id,
    oldValue: { division: oldDivisionName, category: oldCategoryName },
    newValue: { division: newCategory.division.name, category: newCategory.name, notes: data.notes },
  });

  return updated;
}
