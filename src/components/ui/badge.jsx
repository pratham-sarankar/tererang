import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-white',
  outline: 'text-foreground',
  success: 'border-transparent bg-emerald-100 text-emerald-700',
  warning: 'border-transparent bg-amber-100 text-amber-800',
  info: 'border-transparent bg-blue-100 text-blue-700',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
