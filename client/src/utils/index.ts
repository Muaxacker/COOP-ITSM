import { format, formatDistanceToNow, isPast } from 'date-fns';
import { IncidentStatus, Priority, DivisionCode } from '../types';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date) {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: string | Date) {
  try {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  } catch {
    return String(date);
  }
}

export function formatTime(date: string | Date) {
  try {
    return format(new Date(date), 'h:mm a');
  } catch {
    return String(date);
  }
}

export function timeAgo(date: string | Date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return String(date);
  }
}

export function formatTimeRemaining(deadline: string | Date): { text: string; isBreached: boolean } {
  try {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) {
      const abs = Math.abs(diff);
      const hours = Math.floor(abs / 3_600_000);
      const minutes = Math.floor((abs % 3_600_000) / 60_000);
      return {
        text: hours > 0 ? `${hours}h ${minutes}m overdue` : `${minutes}m overdue`,
        isBreached: true,
      };
    }
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    return {
      text: hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`,
      isBreached: false,
    };
  } catch {
    return { text: 'N/A', isBreached: false };
  }
}

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_INFO: 'Waiting for Info',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  OPEN: 'bg-slate-100 text-slate-800 border-slate-300/80',
  ASSIGNED: 'bg-blue-50 text-blue-900 border-blue-200/80',
  IN_PROGRESS: 'bg-amber-50 text-amber-950 border-amber-200/80',
  WAITING_FOR_INFO: 'bg-amber-50 text-amber-900 border-amber-300/80',
  RESOLVED: 'bg-emerald-50 text-emerald-950 border-emerald-200/80',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200/80',
  REOPENED: 'bg-rose-50 text-rose-950 border-rose-200/80',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: 'bg-rose-50 text-rose-950 border-rose-200/80 font-medium',
  HIGH: 'bg-amber-50 text-amber-950 border-amber-200/80 font-medium',
  MEDIUM: 'bg-blue-50 text-blue-950 border-blue-200/80 font-medium',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200/80 font-medium',
};

export const DIVISION_COLORS: Record<DivisionCode, string> = {
  ATM: 'bg-slate-100 text-slate-800 border-slate-300/70',
  APPLICATION: 'bg-slate-100 text-slate-800 border-slate-300/70',
  NETWORKING: 'bg-slate-100 text-slate-800 border-slate-300/70',
  MAINTENANCE: 'bg-slate-100 text-slate-800 border-slate-300/70',
};
