import React from 'react';
import { cn } from '../../utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/40 shadow-sm',
  secondary: 'bg-[#0b2545] text-white hover:bg-[#134074] focus:ring-[#0b2545]/40 shadow-sm',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/40 shadow-sm',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
  outline: 'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:ring-gray-200',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isBusy = loading || isLoading;
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isBusy}
      {...props}
    >
      {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
