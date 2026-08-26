import { format, formatDistanceToNow, isPast, isAfter } from 'date-fns';
import { RequestStatus, Priority, DeadlineStatus } from '../types';

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatTime(date: string | Date) {
  return format(new Date(date), 'h:mm a');
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDeadlineStatus(deadline: string | Date, createdAt: string | Date): DeadlineStatus {
  const deadlineDate = new Date(deadline);
  const createdDate = new Date(createdAt);
  const now = new Date();

  if (isPast(deadlineDate)) return 'OVERDUE';

  const totalMs = deadlineDate.getTime() - createdDate.getTime();
  const remainingMs = deadlineDate.getTime() - now.getTime();
  const ratio = remainingMs / totalMs;

  if (ratio <= 0.25) return 'DEADLINE_APPROACHING';
  return 'ON_TRACK';
}

export function formatTimeRemaining(deadline: string | Date): string {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    const abs = Math.abs(diff);
    const hours = Math.floor(abs / 3_600_000);
    const minutes = Math.floor((abs % 3_600_000) / 60_000);
    if (hours > 0) return `${hours}h ${minutes}m overdue`;
    return `${minutes}m overdue`;
  }
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export function getDeadlinePercent(deadline: string | Date, createdAt: string | Date): number {
  const deadlineDate = new Date(deadline);
  const createdDate = new Date(createdAt);
  const now = new Date();

  const totalMs = deadlineDate.getTime() - createdDate.getTime();
  const elapsedMs = now.getTime() - createdDate.getTime();
  const percent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
  return Math.round(percent);
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: 'New',
  REVIEWED: 'Reviewed',
  ASSIGNED: 'Assigned',
  INVESTIGATING: 'Investigating',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
  OVERDUE: 'Overdue',
  ESCALATED: 'Escalated',
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  NEW: 'bg-info-light text-info',
  REVIEWED: 'bg-info-light text-info',
  ASSIGNED: 'bg-warning-light text-warning',
  INVESTIGATING: 'bg-warning-light text-warning',
  RESOLVED: 'bg-success-light text-success',
  CLOSED: 'bg-gray-100 text-gray-500',
  REOPENED: 'bg-purple-100 text-purple-700',
  OVERDUE: 'bg-danger-light text-danger',
  ESCALATED: 'bg-danger-light text-danger',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-warning-light text-warning',
  HIGH: 'bg-danger-light text-danger',
};

export function getStatusIcon(status: RequestStatus): string {
  const icons: Record<RequestStatus, string> = {
    NEW: '📥',
    REVIEWED: '👁️',
    ASSIGNED: '👤',
    INVESTIGATING: '🔍',
    RESOLVED: '✅',
    CLOSED: '🔒',
    REOPENED: '🔄',
    OVERDUE: '⚠️',
    ESCALATED: '🚨',
  };
  return icons[status] || '📋';
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
