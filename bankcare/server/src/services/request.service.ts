import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { RequestStatus, Priority, Role, ActivityAction, NotificationType } from '../types';
import { generateRequestNumber } from '../utils/requestNumber';
import { createNotification } from './notification.service';
import { getDeadlineStatusFromCreation } from '../utils/deadlineStatus';

// ─── Allowed Status Transitions ──────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  NEW: ['REVIEWED', 'ASSIGNED', 'INVESTIGATING', 'OVERDUE'],
  REVIEWED: ['ASSIGNED', 'INVESTIGATING', 'OVERDUE'],
  ASSIGNED: ['INVESTIGATING', 'OVERDUE'],
  INVESTIGATING: ['RESOLVED', 'ESCALATED', 'OVERDUE'],
  ESCALATED: ['INVESTIGATING', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['INVESTIGATING', 'ASSIGNED', 'OVERDUE'],
  CLOSED: [],
  OVERDUE: ['INVESTIGATING', 'ASSIGNED', 'RESOLVED', 'CLOSED'],
};

function assertTransition(from: RequestStatus, to: RequestStatus) {
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    throw new AppError(
      `Cannot transition from ${from} to ${to}`,
      400
    );
  }
}

// ─── Shared Select ─────────────────────────────────────────────────────────
const REQUEST_SELECT = {
  id: true,
  requestNumber: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  deadline: true,
  resolvedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true, defaultDeadlineHours: true } },
  assignedOfficer: { select: { id: true, name: true, email: true } },
};

// ─── Smart Assignment ──────────────────────────────────────────────────────
async function autoAssignOfficer(departmentId: string): Promise<string | null> {
  // Find active officer in department with the fewest open assigned requests
  const officers = await prisma.user.findMany({
    where: { role: 'OFFICER', departmentId, isActive: true },
    select: {
      id: true,
      _count: {
        select: {
          requestsAsOfficer: {
            where: { status: { in: ['ASSIGNED', 'INVESTIGATING', 'NEW', 'REVIEWED', 'REOPENED', 'ESCALATED'] } },
          },
        },
      },
    },
  });

  if (officers.length === 0) return null;

  // Sort by load (fewest assigned requests)
  officers.sort((a, b) => a._count.requestsAsOfficer - b._count.requestsAsOfficer);
  return officers[0].id;
}

// ─── Create Request ────────────────────────────────────────────────────────
export async function createRequest(data: {
  customerId: string;
  categoryId: string;
  title: string;
  description: string;
}) {
  const category = await prisma.serviceCategory.findUnique({
    where: { id: data.categoryId, isActive: true },
    include: { department: true },
  });
  if (!category) throw new AppError('Invalid or inactive category', 400);

  const requestNumber = await generateRequestNumber();
  const deadline = new Date(Date.now() + category.defaultDeadlineHours * 60 * 60 * 1000);

  // Auto-assign officer
  const assignedOfficerId = await autoAssignOfficer(category.departmentId);

  const request = await prisma.serviceRequest.create({
    data: {
      requestNumber,
      customerId: data.customerId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      priority: category.defaultPriority,
      deadline,
      status: assignedOfficerId ? 'ASSIGNED' : 'NEW',
      assignedOfficerId,
    },
    select: REQUEST_SELECT,
  });

  // Activity: created
  await prisma.requestActivity.create({
    data: {
      requestId: request.id,
      userId: data.customerId,
      action: 'REQUEST_CREATED',
      description: `Request ${requestNumber} submitted by customer`,
      isCustomerVisible: true,
    },
  });

  // Activity: auto-assigned
  if (assignedOfficerId) {
    await prisma.requestActivity.create({
      data: {
        requestId: request.id,
        userId: data.customerId,
        action: 'REQUEST_ASSIGNED',
        description: `Request automatically assigned to officer`,
        isCustomerVisible: true,
      },
    });

    // Notify assigned officer
    await createNotification({
      userId: assignedOfficerId,
      requestId: request.id,
      title: 'New request assigned to you',
      message: `${requestNumber} – ${data.title} has been assigned to you.`,
      type: NotificationType.ASSIGNMENT,
    });
  }

  // Notify managers
  const managers = await prisma.user.findMany({
    where: { role: { in: ['MANAGER', 'ADMIN'] }, isActive: true },
    select: { id: true },
  });
  if (managers.length > 0) {
    await prisma.notification.createMany({
      data: managers.map((m) => ({
        userId: m.id,
        requestId: request.id,
        title: 'New service request created',
        message: `${requestNumber} – ${data.title} (${category.name}) has been submitted.`,
        type: NotificationType.GENERAL,
      })),
    });
  }

  return request;
}

// ─── List Requests ─────────────────────────────────────────────────────────
export async function getRequests(
  requester: { userId: string; role: Role },
  filters: {
    status?: RequestStatus;
    priority?: Priority;
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const { status, priority, categoryId, search, page = 1, limit = 20 } = filters;

  // Build base where clause based on role
  const baseWhere: Record<string, unknown> = {};

  if (requester.role === 'CUSTOMER') {
    baseWhere.customerId = requester.userId;
  } else if (requester.role === 'OFFICER') {
    // Officers see:
    // 1. Requests assigned to them personally
    // 2. Requests unassigned (null) — available to pick up
    // 3. Requests assigned to anyone in their department
    const officer = await prisma.user.findUnique({
      where: { id: requester.userId },
      select: { departmentId: true },
    });

    const deptOfficerIds = officer?.departmentId
      ? await prisma.user.findMany({
          where: { departmentId: officer.departmentId, role: 'OFFICER', isActive: true },
          select: { id: true },
        }).then(officers => officers.map(o => o.id))
      : [requester.userId];

    baseWhere.OR = [
      { assignedOfficerId: requester.userId },          // assigned to me
      { assignedOfficerId: null },                       // unassigned
      { assignedOfficerId: { in: deptOfficerIds } },    // my department
    ];
  }
  // MANAGER and ADMIN see all

  // Build additional filters
  const filterWhere: Record<string, unknown> = {};
  if (status) filterWhere.status = status;
  if (priority) filterWhere.priority = priority;
  if (categoryId) filterWhere.categoryId = categoryId;

  // Combine base + filters correctly (avoid OR being overridden)
  let where: Record<string, unknown>;
  if (Object.keys(baseWhere).length > 0 && Object.keys(filterWhere).length > 0) {
    where = { AND: [baseWhere, filterWhere] };
  } else {
    where = { ...baseWhere, ...filterWhere };
  }

  if (search) {
    const searchClause = {
      OR: [
        { requestNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ],
    };
    where = { AND: [where, searchClause] };
  }

  const [requests, total] = await Promise.all([
    prisma.serviceRequest.findMany({
      where,
      select: REQUEST_SELECT,
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.serviceRequest.count({ where }),
  ]);

  // Attach deadline status
  const requestsWithDeadlineStatus = requests.map((r) => ({
    ...r,
    deadlineStatus: getDeadlineStatusFromCreation(r.deadline, r.createdAt),
  }));

  return { requests: requestsWithDeadlineStatus, total, page, limit };
}

// ─── Get Single Request ─────────────────────────────────────────────────────
export async function getRequestById(
  id: string,
  requester: { userId: string; role: Role },
  customerVisible = false
) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, defaultDeadlineHours: true, department: { select: { id: true, name: true } } } },
      assignedOfficer: { select: { id: true, name: true, email: true } },
      activities: {
        where: customerVisible
          ? { isCustomerVisible: true }
          : {},
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, role: true } } },
      },
      feedback: { select: { id: true, rating: true, comment: true, createdAt: true } },
    },
  });

  if (!request) throw new AppError('Request not found', 404);

  // Ownership check for customers
  if (requester.role === 'CUSTOMER' && request.customerId !== requester.userId) {
    throw new AppError('You are not authorized to view this request', 403);
  }

  // Officers can see their assigned requests or unassigned NEW ones
  if (requester.role === 'OFFICER') {
    const isAssigned = request.assignedOfficerId === requester.userId;
    const isUnassignedNew = !request.assignedOfficerId && request.status === 'NEW';
    if (!isAssigned && !isUnassignedNew) {
      throw new AppError('You are not authorized to view this request', 403);
    }
  }

  return {
    ...request,
    deadlineStatus: getDeadlineStatusFromCreation(request.deadline, request.createdAt),
  };
}

// ─── Review ────────────────────────────────────────────────────────────────
export async function reviewRequest(requestId: string, officerId: string) {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found', 404);

  // If already past REVIEWED (ASSIGNED, INVESTIGATING etc.), skip straight to start
  if (!['NEW', 'REOPENED'].includes(request.status)) {
    throw new AppError(`Request is already ${request.status} — use the appropriate action`, 400);
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: 'REVIEWED',
      // Assign to this officer if not already assigned
      assignedOfficerId: request.assignedOfficerId ?? officerId,
    },
    select: REQUEST_SELECT,
  });

  await prisma.requestActivity.create({
    data: {
      requestId,
      userId: officerId,
      action: 'REQUEST_REVIEWED',
      description: 'Request reviewed',
      isCustomerVisible: true,
    },
  });

  await createNotification({
    userId: request.customerId,
    requestId,
    title: 'Request reviewed',
    message: `Your request ${request.requestNumber} has been reviewed and is being processed.`,
    type: NotificationType.REQUEST_UPDATE,
  });

  return updated;
}

// ─── Assign ────────────────────────────────────────────────────────────────
export async function assignRequest(
  requestId: string,
  officerId: string,
  assignedById: string
) {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found', 404);

  const officer = await prisma.user.findUnique({ where: { id: officerId } });
  if (!officer || officer.role !== 'OFFICER') throw new AppError('Officer not found', 404);

  // Can assign/reassign from any active status
  const terminalStatuses: RequestStatus[] = ['CLOSED'];
  if (terminalStatuses.includes(request.status)) {
    throw new AppError('Cannot reassign a closed request', 400);
  }

  const isReassignment = !!request.assignedOfficerId && request.assignedOfficerId !== officerId;
  // Move status to ASSIGNED only if coming from NEW or REVIEWED
  const newStatus: RequestStatus =
    request.status === 'NEW' || request.status === 'REVIEWED'
      ? 'ASSIGNED'
      : request.status;

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: newStatus, assignedOfficerId: officerId },
    select: REQUEST_SELECT,
  });

  await prisma.requestActivity.create({
    data: {
      requestId,
      userId: assignedById,
      action: isReassignment ? 'REQUEST_REASSIGNED' : 'REQUEST_ASSIGNED',
      description: `Request ${isReassignment ? 'reassigned' : 'assigned'} to ${officer.name}`,
      isCustomerVisible: true,
    },
  });

  await createNotification({
    userId: officerId,
    requestId,
    title: isReassignment ? 'Request reassigned to you' : 'New request assigned to you',
    message: `${request.requestNumber} – ${request.title} has been assigned to you.`,
    type: NotificationType.ASSIGNMENT,
  });

  await createNotification({
    userId: request.customerId,
    requestId,
    title: 'Request assigned',
    message: `Your request ${request.requestNumber} has been assigned to an officer.`,
    type: NotificationType.REQUEST_UPDATE,
  });

  return updated;
}

// ─── Start Investigation ────────────────────────────────────────────────────
export async function startInvestigation(requestId: string, officerId: string) {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found', 404);

  // Allow starting from NEW, REVIEWED, ASSIGNED, REOPENED, OVERDUE
  const validFromStatuses: RequestStatus[] = ['NEW', 'REVIEWED', 'ASSIGNED', 'REOPENED', 'OVERDUE', 'ESCALATED'];
  if (!validFromStatuses.includes(request.status)) {
    throw new AppError(`Cannot start investigation from status: ${request.status}`, 400);
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: 'INVESTIGATING',
      // Take ownership if unassigned
      assignedOfficerId: request.assignedOfficerId ?? officerId,
    },
    select: REQUEST_SELECT,
  });

  await prisma.requestActivity.create({
    data: {
      requestId,
      userId: officerId,
      action: 'INVESTIGATION_STARTED',
      description: 'Investigation started',
      isCustomerVisible: true,
    },
  });

  await createNotification({
    userId: request.customerId,
    requestId,
    title: 'Investigation started',
    message: `An officer has started investigating your request ${request.requestNumber}.`,
    type: NotificationType.REQUEST_UPDATE,
  });

  return updated;
}

// ─── Add Note ──────────────────────────────────────────────────────────────
export async function addNote(requestId: string, userId: string, note: string, isCustomerVisible: boolean) {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found', 404);

  const activity = await prisma.requestActivity.create({
    data: {
      requestId,
      userId,
      action: 'NOTE_ADDED',
      description: note,
      isCustomerVisible,
    },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  return activity;
}

// ─── Escalate ──────────────────────────────────────────────────────────────
export async function escalateRequest(requestId: string, officerId: string, reason: string) {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found', 404);
  assertTransition(request.status, 'ESCALATED');

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'ESCALATED', priority: 'HIGH' },
    select: REQUEST_SELECT,
  });

  await prisma.requestActivity.create({
    data: {
      requestId,
      userId: officerId,
      action: 'ESCALATED',
      description: `Escalated to manager: ${reason}`,
      isCustomerVisible: false,
    },
  });

  // Notify managers
  const managers = await prisma.user.findMany({
    where: { role: { in: ['MANAGER', 'ADMIN'] }, isActive: true },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: managers.map((m) => ({
      userId: m.id,
      requestId,
      title: 'Request escalated',
      message: `${request.requestNumber} – ${request.title} has been escalated and requires your attention.`,
      type: NotificationType.ESCALATION,
    })),
  });

  return updated;
}

// ─── Resolve ───────────────────────────────────────────────────────────────
export async function resolveRequest(requestId: string, officerId: string, resolution: string) {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found', 404);
  assertTransition(request.status, 'RESOLVED');

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'RESOLVED', resolvedAt: new Date() },
    select: REQUEST_SELECT,
  });

  await prisma.requestActivity.create({
    data: {
      requestId,
      userId: officerId,
      action: 'RESOLVED',
      description: resolution,
      isCustomerVisible: true,
    },
  });

  await createNotification({
    userId: request.customerId,
    requestId,
    title: 'Your request has been resolved',
    message: `Request ${request.requestNumber} has been resolved. Please confirm if your issue is resolved.`,
    type: NotificationType.RESOLUTION,
  });

  return updated;
}

// ─── Reopen ────────────────────────────────────────────────────────────────
export async function reopenRequest(requestId: string, customerId: string, reason: string) {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found', 404);

  if (request.customerId !== customerId) throw new AppError('Forbidden', 403);
  assertTransition(request.status, 'REOPENED');

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'REOPENED', resolvedAt: null },
    select: REQUEST_SELECT,
  });

  await prisma.requestActivity.create({
    data: {
      requestId,
      userId: customerId,
      action: 'REOPENED',
      description: `Customer reopened request: ${reason}`,
      isCustomerVisible: true,
    },
  });

  // Notify assigned officer
  if (request.assignedOfficerId) {
    await createNotification({
      userId: request.assignedOfficerId,
      requestId,
      title: 'Request reopened',
      message: `${request.requestNumber} has been reopened by the customer.`,
      type: NotificationType.REQUEST_UPDATE,
    });
  }

  // Notify managers
  const managers = await prisma.user.findMany({
    where: { role: { in: ['MANAGER', 'ADMIN'] }, isActive: true },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: managers.map((m) => ({
      userId: m.id,
      requestId,
      title: 'Request reopened',
      message: `${request.requestNumber} has been reopened by the customer.`,
      type: NotificationType.REQUEST_UPDATE,
    })),
  });

  return updated;
}

// ─── Close ─────────────────────────────────────────────────────────────────
export async function closeRequest(requestId: string, userId: string) {
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError('Request not found', 404);

  // Customers can only close their own resolved requests
  if (request.customerId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
      throw new AppError('Forbidden', 403);
    }
  }

  assertTransition(request.status, 'CLOSED');

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'CLOSED', closedAt: new Date() },
    select: REQUEST_SELECT,
  });

  await prisma.requestActivity.create({
    data: {
      requestId,
      userId,
      action: 'CLOSED',
      description: 'Request closed',
      isCustomerVisible: true,
    },
  });

  return updated;
}

// ─── Mark Overdue (called by cron) ─────────────────────────────────────────
export async function markOverdueRequests() {
  const activeStatuses: RequestStatus[] = ['NEW', 'REVIEWED', 'ASSIGNED', 'INVESTIGATING', 'REOPENED', 'ESCALATED'];

  const overdueRequests = await prisma.serviceRequest.findMany({
    where: {
      status: { in: activeStatuses },
      deadline: { lt: new Date() },
    },
    select: { id: true, requestNumber: true, title: true, customerId: true, assignedOfficerId: true },
  });

  for (const req of overdueRequests) {
    await prisma.serviceRequest.update({
      where: { id: req.id },
      data: { status: 'OVERDUE' },
    });

    await prisma.requestActivity.create({
      data: {
        requestId: req.id,
        userId: req.customerId,
        action: 'OVERDUE_MARKED',
        description: 'Request marked as overdue — deadline passed',
        isCustomerVisible: false,
      },
    });

    const notifications = [];

    if (req.assignedOfficerId) {
      notifications.push({
        userId: req.assignedOfficerId,
        requestId: req.id,
        title: 'Request overdue',
        message: `${req.requestNumber} – ${req.title} is now overdue.`,
        type: NotificationType.OVERDUE,
      });
    }

    const managers = await prisma.user.findMany({
      where: { role: { in: ['MANAGER', 'ADMIN'] }, isActive: true },
      select: { id: true },
    });

    for (const m of managers) {
      notifications.push({
        userId: m.id,
        requestId: req.id,
        title: 'Request overdue',
        message: `${req.requestNumber} – ${req.title} is now overdue.`,
        type: NotificationType.OVERDUE,
      });
    }

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }
  }

  return overdueRequests.length;
}
