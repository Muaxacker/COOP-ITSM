import api from './api';
import { Notification, ApiResponse } from '../types';

export async function getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const res = await api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>('/notifications');
  return res.data.data;
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}
