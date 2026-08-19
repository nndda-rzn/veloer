import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: string;
  iconBg?: string;
  iconColor?: string;
}

export function KpiCard({
  label,
  value,
  icon,
  trend,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary',
}: KpiCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          {icon && (
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
            >
              {icon}
            </div>
          )}
        </div>
        <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
        {trend && <p className="mt-1 text-xs text-gray-400">{trend}</p>}
      </CardContent>
    </Card>
  );
}
