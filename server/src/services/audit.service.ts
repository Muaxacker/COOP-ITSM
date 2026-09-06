import { prisma } from '../config/prisma';

interface LogAuditParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string | Record<string, any> | null;
  newValue?: string | Record<string, any> | null;
}

export async function logAudit({
  userId,
  action,
  entityType,
  entityId,
  oldValue,
  newValue,
}: LogAuditParams) {
  try {
    const oldValStr = typeof oldValue === 'object' && oldValue !== null ? JSON.stringify(oldValue) : oldValue || null;
    const newValStr = typeof newValue === 'object' && newValue !== null ? JSON.stringify(newValue) : newValue || null;

    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId,
        oldValue: oldValStr,
        newValue: newValStr,
      },
    });
  } catch (error) {
    // Non-blocking for primary operational flow, log to stderr
    console.error('Failed to record audit log:', error);
    return null;
  }
}

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 25));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.action) {
    where.action = { contains: params.action, mode: 'insensitive' };
  }
  if (params.entityType) {
    where.entityType = params.entityType;
  }
  if (params.userId) {
    where.userId = params.userId;
  }
  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) where.createdAt.gte = new Date(params.startDate);
    if (params.endDate) where.createdAt.lte = new Date(params.endDate);
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
