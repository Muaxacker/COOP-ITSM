import React from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-slate-200/90 shadow-subtle', padding && 'p-4 sm:p-5', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-3.5', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-900 tracking-tight', className)}>
      {children}
    </h3>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  colorClass?: string;
  subtext?: string;
}

export function StatCard({ label, value, icon, colorClass = 'text-slate-900', subtext }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-subtle flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-1.5 rounded bg-slate-50 border border-slate-200/70 text-slate-600">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className={cn('text-2xl font-semibold tracking-tight tabular-nums', colorClass)}>
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] text-slate-500 mt-0.5">{subtext}</p>
        )}
      </div>
    </div>
  );
}
