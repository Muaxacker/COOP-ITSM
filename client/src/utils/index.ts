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
  OPEN: 'bg-blue-100 text-blue-800 border border-blue-200',
  ASSIGNED: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border border-amber-200',
  WAITING_FOR_INFO: 'bg-orange-100 text-orange-800 border border-orange-200',
  RESOLVED: 'bg-teal-100 text-teal-800 border border-teal-200',
  CLOSED: 'bg-slate-100 text-slate-700 border border-slate-200',
  REOPENED: 'bg-rose-100 text-rose-800 border border-rose-200',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border border-red-300 font-semibold',
  HIGH: 'bg-orange-100 text-orange-800 border border-orange-200 font-medium',
  MEDIUM: 'bg-amber-100 text-amber-800 border border-amber-200',
  LOW: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
};

export const DIVISION_COLORS: Record<DivisionCode, string> = {
  ATM: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  APPLICATION: 'bg-violet-100 text-violet-800 border-violet-200',
  NETWORKING: 'bg-blue-100 text-blue-800 border-blue-200',
  MAINTENANCE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};
