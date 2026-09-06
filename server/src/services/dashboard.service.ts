import { prisma } from '../config/prisma';
import { IncidentStatus, Priority, Role } from '../types';

export async function getDashboardData(currentUser: {
  userId: string;
  role: Role;
  branchId?: string | null;
  divisionId?: string | null;
}) {
  switch (currentUser.role) {
    case Role.BRANCH_USER:
      return getBranchUserDashboard(currentUser.userId, currentUser.branchId);
    case Role.TECHNICIAN:
      return getTechnicianDashboard(currentUser.userId, currentUser.divisionId);
    case Role.IT_SUPERVISOR:
      return getSupervisorDashboard();
    case Role.ADMIN:
      return getAdminDashboard();
    default:
      return getSupervisorDashboard();
  }
}

async function getBranchUserDashboard(userId: string, branchId?: string | null) {
  const branchFilter = branchId ? { branchId } : { reportedById: userId };

  const [total, open, active, resolved, closed, recentIncidents] = await Promise.all([
    prisma.incident.count({ where: branchFilter }),
    prisma.incident.count({ where: { ...branchFilter, status: IncidentStatus.OPEN } }),
    prisma.incident.count({
      where: {
        ...branchFilter,
        status: { in: [IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.WAITING_FOR_INFO] },
      },
    }),
    prisma.incident.count({ where: { ...branchFilter, status: IncidentStatus.RESOLVED } }),
    prisma.incident.count({ where: { ...branchFilter, status: IncidentStatus.CLOSED } }),
    prisma.incident.findMany({
      where: branchFilter,
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        category: { include: { division: true } },
        assignedTechnician: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    kpis: {
      total,
      open,
      active,
      resolved,
      closed,
    },
    recentIncidents,
  };
}

async function getTechnicianDashboard(userId: string, divisionId?: string | null) {
  const now = new Date();
  const approachingDeadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const [assignedTotal, active, resolved, breachedSla, approachingSla, myIncidents, divisionOpen] = await Promise.all([
    prisma.incident.count({ where: { assignedTechnicianId: userId } }),
    prisma.incident.count({
      where: {
        assignedTechnicianId: userId,
        status: { in: [IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.WAITING_FOR_INFO] },
      },
    }),
    prisma.incident.count({
      where: {
        assignedTechnicianId: userId,
        status: { in: [IncidentStatus.RESOLVED, IncidentStatus.CLOSED] },
      },
    }),
    prisma.incident.count({
      where: {
        assignedTechnicianId: userId,
        slaBreached: true,
        status: { notIn: [IncidentStatus.CLOSED] },
      },
    }),
    prisma.incident.count({
      where: {
        assignedTechnicianId: userId,
        status: { in: [IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS] },
        slaDeadline: { lte: approachingDeadline, gte: now },
        slaBreached: false,
      },
    }),
    prisma.incident.findMany({
      where: {
        assignedTechnicianId: userId,
        status: { not: IncidentStatus.CLOSED },
      },
      orderBy: [{ priority: 'asc' }, { slaDeadline: 'asc' }],
      take: 10,
      include: {
        branch: true,
        category: { include: { division: true } },
        reportedBy: { select: { id: true, name: true, phone: true } },
      },
    }),
    divisionId
      ? prisma.incident.findMany({
          where: {
            category: { divisionId },
            status: IncidentStatus.OPEN,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { branch: true, category: true },
        })
      : Promise.resolve([]),
  ]);

  return {
    kpis: {
      assignedTotal,
      active,
      resolved,
      breachedSla,
      approachingSla,
    },
    myIncidents,
    divisionOpen,
  };
}

async function getSupervisorDashboard() {
  const [
    total,
    open,
    active,
    critical,
    breached,
    divisions,
    recentIncidents,
  ] = await Promise.all([
    prisma.incident.count(),
    prisma.incident.count({ where: { status: IncidentStatus.OPEN } }),
    prisma.incident.count({
      where: {
        status: { in: [IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.WAITING_FOR_INFO] },
      },
    }),
    prisma.incident.count({
      where: {
        priority: Priority.CRITICAL,
        status: { not: IncidentStatus.CLOSED },
      },
    }),
    prisma.incident.count({
      where: {
        slaBreached: true,
        status: { not: IncidentStatus.CLOSED },
      },
    }),
    prisma.division.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        categories: {
          select: {
            _count: { select: { incidents: true } },
          },
        },
      },
    }),
    prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        branch: true,
        category: { include: { division: true } },
        assignedTechnician: { select: { id: true, name: true } },
        reportedBy: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Division breakdown
  const incidentsByDivision = divisions.map((d) => {
    const count = d.categories.reduce((acc, cat) => acc + cat._count.incidents, 0);
    return {
      divisionId: d.id,
      name: d.name,
      code: d.code,
      count,
    };
  });

  // By Status
  const [openCount, assignedCount, inProgressCount, waitingCount, resolvedCount, closedCount] = await Promise.all([
    prisma.incident.count({ where: { status: IncidentStatus.OPEN } }),
    prisma.incident.count({ where: { status: IncidentStatus.ASSIGNED } }),
    prisma.incident.count({ where: { status: IncidentStatus.IN_PROGRESS } }),
    prisma.incident.count({ where: { status: IncidentStatus.WAITING_FOR_INFO } }),
    prisma.incident.count({ where: { status: IncidentStatus.RESOLVED } }),
    prisma.incident.count({ where: { status: IncidentStatus.CLOSED } }),
  ]);

  return {
    kpis: {
      total,
      open,
      active,
      critical,
      breached,
    },
    incidentsByDivision,
    incidentsByStatus: {
      OPEN: openCount,
      ASSIGNED: assignedCount,
      IN_PROGRESS: inProgressCount,
      WAITING_FOR_INFO: waitingCount,
      RESOLVED: resolvedCount,
      CLOSED: closedCount,
    },
    recentIncidents,
  };
}

async function getAdminDashboard() {
  const [
    totalUsers,
    totalBranches,
    totalDivisions,
    totalIncidents,
    activeIncidents,
    resolvedIncidents,
    breachedCount,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.branch.count({ where: { isActive: true } }),
    prisma.division.count(),
    prisma.incident.count(),
    prisma.incident.count({
      where: {
        status: { in: [IncidentStatus.OPEN, IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.WAITING_FOR_INFO] },
      },
    }),
    prisma.incident.count({
      where: { status: { in: [IncidentStatus.RESOLVED, IncidentStatus.CLOSED] } },
    }),
    prisma.incident.count({ where: { slaBreached: true } }),
  ]);

  const slaComplianceRate = totalIncidents > 0
    ? Math.round(((totalIncidents - breachedCount) / totalIncidents) * 100)
    : 100;

  return {
    kpis: {
      totalUsers,
      totalBranches,
      totalDivisions,
      totalIncidents,
      activeIncidents,
      resolvedIncidents,
      slaComplianceRate,
    },
  };
}
