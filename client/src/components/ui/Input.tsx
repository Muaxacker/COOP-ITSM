import React from 'react';
import { cn } from '../../utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, hint, leftIcon, rightIcon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{leftIcon}</div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-10 rounded-md border bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors shadow-subtle',
            'focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900',
            error ? 'border-rose-300 focus:ring-rose-800 focus:border-rose-800' : 'border-slate-300',
            leftIcon ? 'pl-9' : 'pl-3.5',
            rightIcon ? 'pr-9' : 'pr-3.5',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{rightIcon}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-semibold">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500 font-medium">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-md border bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors resize-none p-3 shadow-subtle',
          'focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900',
          error ? 'border-rose-300 focus:ring-rose-800 focus:border-rose-800' : 'border-slate-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-semibold">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500 font-medium">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, hint, options, placeholder, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full h-10 rounded-md border bg-white text-sm font-medium text-slate-900 transition-colors pl-3.5 pr-8 shadow-subtle',
          'focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900',
          error ? 'border-rose-300' : 'border-slate-300',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 font-semibold">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500 font-medium">{hint}</p>}
    </div>
  );
}
