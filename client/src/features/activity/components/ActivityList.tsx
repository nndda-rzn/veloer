import { Link } from 'react-router-dom';
import type { Activity } from '../types/activity';
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  formatDate,
  formatActivityType,
} from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui';
import { Bike } from 'lucide-react';
import { EmptyState } from '@/shared/components/ui';

interface ActivityListProps {
  activities: Activity[];
  loading: boolean;
}

export function ActivityList({ activities, loading }: ActivityListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Bike}
        title="No activities yet"
        description="Sync from Strava to see your cycling activities here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-100">
        <caption className="sr-only">List of cycling activities</caption>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Activity
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Distance
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Duration
            </th>
            <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
              Avg Speed
            </th>
            <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
              Elevation
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {activities.map((activity) => (
            <tr key={activity.id} className="transition-colors hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">
                {formatDate(activity.start_date)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/activities/${activity.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary"
                  >
                    {activity.name}
                  </Link>
                  <Badge variant="neutral">{formatActivityType(activity.type)}</Badge>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                {formatDistance(activity.distance)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">
                {formatDuration(activity.moving_time)}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 md:table-cell">
                {activity.avg_speed ? formatSpeed(activity.avg_speed) : '—'}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 md:table-cell">
                {activity.total_elevation_gain != null
                  ? `${activity.total_elevation_gain.toFixed(0)} m`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
