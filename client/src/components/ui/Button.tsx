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
  primary: 'bg-[#0B2545] text-white hover:bg-[#134074] active:bg-[#07192F] border border-transparent focus:ring-2 focus:ring-slate-900 shadow-subtle',
  secondary: 'bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100 border border-slate-300 focus:ring-2 focus:ring-slate-400 shadow-subtle',
  outline: 'bg-transparent text-slate-800 hover:bg-slate-100 border border-slate-300 focus:ring-2 focus:ring-slate-400',
  danger: 'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 border border-transparent focus:ring-2 focus:ring-rose-900 shadow-subtle',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:ring-slate-300',
};

const sizes = {
  sm: 'h-8 px-3.5 text-xs gap-1.5 rounded-md font-semibold',
  md: 'h-10 px-4 text-sm gap-2 rounded-md font-semibold',
  lg: 'h-11 px-5 text-base gap-2.5 rounded-md font-bold',
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
        'inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
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
