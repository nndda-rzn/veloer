import type { ActivityStats } from '../types/activity';
import { formatDistance, formatDuration } from '@/shared/lib/utils';

interface ActivityStatsBarProps {
  stats: ActivityStats | null;
  loading: boolean;
}

export function ActivityStatsBar({ stats, loading }: ActivityStatsBarProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total Rides', value: String(stats.count) },
    { label: 'Total Distance', value: formatDistance(stats.totalDistance) },
    { label: 'Total Time', value: formatDuration(stats.totalMovingTime) },
    { label: 'Total Elevation', value: `${stats.totalElevationGain.toFixed(0)} m` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{item.label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
