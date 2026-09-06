import React from 'react';
import { cn, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, DIVISION_COLORS } from '../../utils';
import { IncidentStatus, Priority, DivisionCode } from '../../types';

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

export function Badge({ className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700'}>
      {PRIORITY_LABELS[priority] || priority}
    </Badge>
  );
}

export function DivisionBadge({ code, name }: { code?: DivisionCode; name?: string }) {
  const color = code ? DIVISION_COLORS[code] : 'bg-blue-50 text-blue-700 border-blue-200';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', color)}>
      {name || code}
    </span>
  );
}

export function SlaBadge({ deadline, breached }: { deadline: string | Date; breached?: boolean }) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const isOverdue = breached || deadlineDate < now;
  const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        SLA Breached
      </span>
    );
  }

  if (hoursLeft <= 1) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        SLA Approaching
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Within SLA
    </span>
  );
}
