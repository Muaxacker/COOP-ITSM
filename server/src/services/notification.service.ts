import { prisma } from '../config/prisma';
import { NotificationType } from '../types';

export async function createNotification(data: {
  userId: string;
  incidentId?: string;
  title: string;
  message: string;
  type: NotificationType;
}) {
  return prisma.notification.create({ data });
}

export async function createNotifications(
  notifications: Array<{
    userId: string;
    incidentId?: string;
    title: string;
    message: string;
    type: NotificationType;
  }>
) {
  if (notifications.length === 0) return;
  return prisma.notification.createMany({ data: notifications });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      incident: { select: { id: true, incidentNumber: true, title: true } },
    },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
