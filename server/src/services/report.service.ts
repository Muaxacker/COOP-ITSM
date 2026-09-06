import { prisma } from '../config/prisma';
import { IncidentStatus, Priority, Role } from '../types';

export async function getOperationalReports() {
  const [
    divisions,
    branches,
    categories,
    priorityStats,
    technicians,
    resolvedIncidents,
  ] = await Promise.all([
    // Incidents by division
    prisma.division.findMany({
      include: {
        categories: {
          select: {
            _count: { select: { incidents: true } },
          },
        },
      },
    }),
    // Incidents by branch
    prisma.branch.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        location: true,
        _count: { select: { incidents: true } },
      },
      orderBy: { incidents: { _count: 'desc' } },
    }),
    // Incidents by category
    prisma.incidentCategory.findMany({
      select: {
        id: true,
        name: true,
        division: { select: { name: true, code: true } },
        _count: { select: { incidents: true } },
      },
      orderBy: { incidents: { _count: 'desc' } },
      take: 10,
    }),
    // Incidents by priority
    Promise.all([
      prisma.incident.count({ where: { priority: Priority.CRITICAL } }),
      prisma.incident.count({ where: { priority: Priority.HIGH } }),
      prisma.incident.count({ where: { priority: Priority.MEDIUM } }),
      prisma.incident.count({ where: { priority: Priority.LOW } }),
    ]),
    // Technicians workload & performance
    prisma.user.findMany({
      where: { role: Role.TECHNICIAN },
      select: {
        id: true,
        name: true,
        email: true,
        division: { select: { name: true, code: true } },
        incidentsAssigned: {
          select: {
            id: true,
            status: true,
            slaBreached: true,
            createdAt: true,
            resolvedAt: true,
          },
        },
      },
    }),
    // Resolved incidents for average resolution time calculation
    prisma.incident.findMany({
      where: {
        status: { in: [IncidentStatus.RESOLVED, IncidentStatus.CLOSED] },
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    }),
  ]);

  // Format division stats
  const byDivision = divisions.map((d) => ({
    divisionId: d.id,
    name: d.name,
    code: d.code,
    totalIncidents: d.categories.reduce((acc, cat) => acc + cat._count.incidents, 0),
  }));

  // Format branch stats
  const byBranch = branches.map((b) => ({
    branchId: b.id,
    name: b.name,
    code: b.code,
    location: b.location,
    totalIncidents: b._count.incidents,
  }));

  // Format category stats
  const byCategory = categories.map((c) => ({
    categoryId: c.id,
    name: c.name,
    divisionName: c.division.name,
    totalIncidents: c._count.incidents,
  }));

  // Format priority stats
  const byPriority = {
    CRITICAL: priorityStats[0],
    HIGH: priorityStats[1],
    MEDIUM: priorityStats[2],
    LOW: priorityStats[3],
  };

  // Technician performance
  const technicianPerformance = technicians.map((tech) => {
    const totalAssigned = tech.incidentsAssigned.length;
    const active = tech.incidentsAssigned.filter((i) =>
      ([IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.WAITING_FOR_INFO] as IncidentStatus[]).includes(i.status)
    ).length;
    const resolved = tech.incidentsAssigned.filter((i) =>
      ([IncidentStatus.RESOLVED, IncidentStatus.CLOSED] as IncidentStatus[]).includes(i.status)
    ).length;
    const breached = tech.incidentsAssigned.filter((i) => i.slaBreached).length;

    // Calculate average resolution time for this technician (in hours)
    const resolvedWithDates = tech.incidentsAssigned.filter((i) => i.resolvedAt);
    let avgResolutionHours = 0;
    if (resolvedWithDates.length > 0) {
      const totalMs = resolvedWithDates.reduce((sum, i) => {
        return sum + (new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime());
      }, 0);
      avgResolutionHours = Math.round((totalMs / (resolvedWithDates.length * 1000 * 60 * 60)) * 10) / 10;
    }

    return {
      technicianId: tech.id,
      name: tech.name,
      email: tech.email,
      division: tech.division?.name || 'General',
      totalAssigned,
      active,
      resolved,
      breached,
      avgResolutionHours,
    };
  });

  // Overall average resolution time
  let overallAvgResolutionHours = 0;
  if (resolvedIncidents.length > 0) {
    const totalMs = resolvedIncidents.reduce((sum, i) => {
      return sum + (new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime());
    }, 0);
    overallAvgResolutionHours = Math.round((totalMs / (resolvedIncidents.length * 1000 * 60 * 60)) * 10) / 10;
  }

  return {
    byDivision,
    byBranch,
    byCategory,
    byPriority,
    technicianPerformance,
    overallAvgResolutionHours,
  };
}
