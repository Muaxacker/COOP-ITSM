import { prisma } from '../config/prisma';
import { RequestStatus } from '../types';

// ─── Customer Dashboard ────────────────────────────────────────────────────
export async function getCustomerDashboard(customerId: string) {
  const [totalRequests, activeRequests, resolvedRequests, recentRequests, unreadNotifications] =
    await Promise.all([
      prisma.serviceRequest.count({ where: { customerId } }),
      prisma.serviceRequest.count({
        where: {
          customerId,
          status: { notIn: ['RESOLVED', 'CLOSED'] },
        },
      }),
      prisma.serviceRequest.count({
        where: {
          customerId,
          status: { in: ['RESOLVED', 'CLOSED'] },
        },
      }),
      prisma.serviceRequest.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          requestNumber: true,
          title: true,
          status: true,
          priority: true,
          deadline: true,
          createdAt: true,
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.notification.count({ where: { userId: customerId, isRead: false } }),
    ]);

  return {
    stats: { totalRequests, activeRequests, resolvedRequests },
    recentRequests,
    unreadNotifications,
  };
}

// ─── Officer Dashboard ─────────────────────────────────────────────────────
export async function getOfficerDashboard(officerId: string) {
  const now = new Date();

  const [openRequests, newRequests, dueSoon, overdue, completedToday, attentionRequests] =
    await Promise.all([
      // Open: assigned to me, active
      prisma.serviceRequest.count({
        where: {
          assignedOfficerId: officerId,
          status: { in: ['ASSIGNED', 'INVESTIGATING', 'REOPENED', 'ESCALATED'] },
        },
      }),
      // New today
      prisma.serviceRequest.count({
        where: {
          assignedOfficerId: officerId,
          createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
        },
      }),
      // Due within 4 hours
      prisma.serviceRequest.count({
        where: {
          assignedOfficerId: officerId,
          status: { in: ['ASSIGNED', 'INVESTIGATING', 'REOPENED', 'ESCALATED'] },
          deadline: { lte: new Date(Date.now() + 4 * 60 * 60 * 1000), gt: new Date() },
        },
      }),
      // Overdue
      prisma.serviceRequest.count({
        where: {
          assignedOfficerId: officerId,
          status: 'OVERDUE',
        },
      }),
      // Resolved today
      prisma.serviceRequest.count({
        where: {
          assignedOfficerId: officerId,
          status: { in: ['RESOLVED', 'CLOSED'] },
          resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      // Requests needing attention (priority sorted)
      prisma.serviceRequest.findMany({
        where: {
          OR: [
            { assignedOfficerId: officerId, status: { in: ['ASSIGNED', 'INVESTIGATING', 'REOPENED', 'ESCALATED', 'OVERDUE'] } },
            { assignedOfficerId: null, status: 'NEW' },
          ],
        },
        orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
        take: 10,
        select: {
          id: true,
          requestNumber: true,
          title: true,
          status: true,
          priority: true,
          deadline: true,
          createdAt: true,
          customer: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
      }),
    ]);

  return {
    stats: {
      openRequests,
      newRequests,
      dueSoon,
      overdue,
      completedToday,
    },
    attentionRequests,
  };
}

// ─── Manager Dashboard ─────────────────────────────────────────────────────
export async function getManagerDashboard() {
  const now = new Date();

  const [totalRequests, openRequests, resolvedRequests, overdueRequests, avgResolutionTime, avgRating, overdueList, escalatedList] =
    await Promise.all([
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({
        where: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
      }),
      prisma.serviceRequest.count({
        where: { status: { in: ['RESOLVED', 'CLOSED'] } },
      }),
      prisma.serviceRequest.count({
        where: { status: 'OVERDUE' },
      }),
      // Average resolution time in hours (using Prisma raw with correct quoted column names)
      prisma.$queryRaw<Array<{ avg_hours: number | null }>>`
        SELECT AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600) as avg_hours
        FROM service_requests
        WHERE "resolvedAt" IS NOT NULL
        AND status IN ('RESOLVED', 'CLOSED')
      `,
      // Average rating
      prisma.feedback.aggregate({
        _avg: { rating: true },
      }),
      // Overdue requests (top 10)
      prisma.serviceRequest.findMany({
        where: { status: 'OVERDUE' },
        orderBy: { deadline: 'asc' },
        take: 10,
        select: {
          id: true,
          requestNumber: true,
          title: true,
          priority: true,
          deadline: true,
          createdAt: true,
          customer: { select: { id: true, name: true } },
          assignedOfficer: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      // Escalated requests
      prisma.serviceRequest.findMany({
        where: { status: 'ESCALATED' },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          requestNumber: true,
          title: true,
          priority: true,
          deadline: true,
          createdAt: true,
          customer: { select: { id: true, name: true } },
          assignedOfficer: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
      }),
    ]);

  // Deadline approaching (within next 2 hours, not yet overdue)
  const deadlineApproaching = await prisma.serviceRequest.findMany({
    where: {
      status: { in: ['ASSIGNED', 'INVESTIGATING', 'REOPENED'] },
      deadline: {
        gt: now,
        lte: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
    },
    orderBy: { deadline: 'asc' },
    take: 10,
    select: {
      id: true,
      requestNumber: true,
      title: true,
      priority: true,
      deadline: true,
      createdAt: true,
      customer: { select: { id: true, name: true } },
      assignedOfficer: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });

  const totalClosed = await prisma.serviceRequest.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } });
  const total = await prisma.serviceRequest.count();
  const onTimeResolutionRate = total > 0 ? Math.round((totalClosed / total) * 100) : 0;

  return {
    stats: {
      totalRequests,
      openRequests,
      resolvedRequests,
      overdueRequests,
      onTimeResolutionRate,
      avgResolutionHours: avgResolutionTime[0]?.avg_hours
        ? Math.round(Number(avgResolutionTime[0].avg_hours) * 10) / 10
        : null,
      avgRating: avgRating._avg.rating
        ? Math.round(avgRating._avg.rating * 10) / 10
        : null,
    },
    overdueRequests: overdueList,
    escalatedRequests: escalatedList,
    deadlineApproaching,
  };
}
