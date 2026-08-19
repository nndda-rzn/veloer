import type { ReactNode } from 'react';

export interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: ReactNode;
}

const variantClasses: Record<NonNullable<AlertProps['variant']>, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function Alert({ variant = 'error', children }: AlertProps) {
  return (
    <div role="alert" className={`rounded-xl border p-4 text-sm ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}
