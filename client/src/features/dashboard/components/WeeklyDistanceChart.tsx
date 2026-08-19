import type { ActivityStats } from '@/features/activity';
import { formatDistance, formatDuration } from '@/shared/lib/utils';
import { Route, Activity, Clock, TrendingUp } from 'lucide-react';

interface ActivitySummaryCardProps {
  stats: ActivityStats | null;
}

export function WeeklyDistanceChart({ stats }: ActivitySummaryCardProps) {
  const items = [
    {
      icon: Route,
      label: 'Total Distance',
      value: stats ? formatDistance(stats.totalDistance) : '—',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: Activity,
      label: 'Total Rides',
      value: stats ? String(stats.count) : '—',
      color: 'text-primary',
      bg: 'bg-primary-50',
    },
    {
      icon: Clock,
      label: 'Moving Time',
      value: stats ? formatDuration(stats.totalMovingTime) : '—',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      label: 'Elevation',
      value: stats ? `${stats.totalElevationGain.toFixed(0)} m` : '—',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Activity Summary</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex flex-col gap-2">
              <div className={`w-fit rounded-lg p-2 ${item.bg}`}>
                <Icon className={`h-4 w-4 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
