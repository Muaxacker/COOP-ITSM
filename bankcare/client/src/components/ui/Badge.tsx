import React from 'react';
import { cn, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '../../utils';
import { RequestStatus, Priority, DeadlineStatus } from '../../types';

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

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={PRIORITY_COLORS[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function DeadlineStatusBadge({ status }: { status: DeadlineStatus }) {
  const config: Record<DeadlineStatus, { label: string; className: string; dot: string }> = {
    ON_TRACK: { label: 'On Track', className: 'text-success', dot: 'bg-success' },
    DEADLINE_APPROACHING: { label: 'Due Soon', className: 'text-warning', dot: 'bg-warning' },
    OVERDUE: { label: 'Overdue', className: 'text-danger', dot: 'bg-danger' },
  };
  const c = config[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', c.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}
