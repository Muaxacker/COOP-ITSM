import React from 'react';
import { cn, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, DIVISION_COLORS } from '../../utils';
import { IncidentStatus, Priority, DivisionCode } from '../../types';

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

export function Badge({ className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-tight', className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <Badge className={STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-200'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={PRIORITY_COLORS[priority] || 'bg-slate-100 text-slate-700 border-slate-200'}>
      {PRIORITY_LABELS[priority] || priority}
    </Badge>
  );
}

export function DivisionBadge({ code, name }: { code?: DivisionCode; name?: string }) {
  const color = code ? DIVISION_COLORS[code] : 'bg-slate-100 text-slate-800 border-slate-200';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border', color)}>
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
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-900 border border-rose-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        SLA Breached
      </span>
    );
  }

  if (hoursLeft <= 1) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        SLA Approaching
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      Within SLA
    </span>
  );
}
