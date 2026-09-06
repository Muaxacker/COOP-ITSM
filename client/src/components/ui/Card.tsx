import React from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-slate-200/90 shadow-subtle', padding && 'p-5', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-base font-bold text-slate-900 tracking-tight', className)}>
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
    <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-subtle flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className={cn('text-3xl font-extrabold font-mono tracking-tight tabular-nums', colorClass)}>
          {value}
        </p>
        {subtext && (
          <p className="text-xs font-medium text-slate-600 mt-1">{subtext}</p>
        )}
      </div>
    </div>
  );
}
