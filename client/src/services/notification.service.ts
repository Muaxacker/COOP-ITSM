import api from './api';
import { Notification, ApiResponse } from '../types';

export async function getNotifications() {
  const res = await api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>('/notifications');
  return res.data.data!;
}

export async function markAsRead(id: string) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead() {
  await api.patch('/notifications/read-all');
}
