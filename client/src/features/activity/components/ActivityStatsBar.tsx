import { Route, Activity, Clock, TrendingUp } from 'lucide-react';
import type { ActivityStats } from '../types/activity';
import { formatDistance, formatDuration } from '@/shared/lib/utils';

interface ActivityStatsBarProps {
  stats: ActivityStats | null;
  loading: boolean;
}

export function ActivityStatsBar({ stats, loading }: ActivityStatsBarProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Total Rides',
      value: String(stats.count),
      icon: Activity,
      color: 'text-primary',
      bg: 'bg-primary-50',
    },
    {
      label: 'Total Distance',
      value: formatDistance(stats.totalDistance),
      icon: Route,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Moving Time',
      value: formatDuration(stats.totalMovingTime),
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Elevation',
      value: `${stats.totalElevationGain.toFixed(0)} m`,
      icon: TrendingUp,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className={`mb-2 w-fit rounded-lg p-1.5 ${item.bg}`}>
              <Icon className={`h-4 w-4 ${item.color}`} aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
