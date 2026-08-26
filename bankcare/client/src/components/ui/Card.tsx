import React from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-card', padding && 'p-5', className)}>
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
    <h3 className={cn('text-sm font-semibold text-text-primary', className)}>
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

export function StatCard({ label, value, icon, colorClass = 'text-text-primary', subtext }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">{label}</p>
          <p className={cn('text-2xl font-bold mt-1', colorClass)}>{value}</p>
          {subtext && <p className="text-xs text-text-muted mt-0.5">{subtext}</p>}
        </div>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>
    </Card>
  );
}
