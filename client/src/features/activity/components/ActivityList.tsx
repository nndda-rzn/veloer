import { Link } from 'react-router-dom';
import type { Activity } from '../types/activity';
import { formatDistance, formatDuration, formatSpeed, formatDate } from '@/shared/lib/utils';

interface ActivityListProps {
  activities: Activity[];
  loading: boolean;
}

export function ActivityList({ activities, loading }: ActivityListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <span className="text-4xl">🚴</span>
        <p className="mt-2 text-sm font-medium text-gray-900">No activities yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Sync from Strava to see your cycling activities here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Distance
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Duration
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Avg Speed
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Elev
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <tr key={activity.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(activity.start_date)}
              </td>
              <td className="px-6 py-4">
                <Link
                  to={`/activities/${activity.id}`}
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                  {activity.name}
                </Link>
                <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {activity.type}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                {formatDistance(activity.distance)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                {formatDuration(activity.moving_time)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                {activity.avg_speed ? formatSpeed(activity.avg_speed) : '-'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                {activity.total_elevation_gain != null
                  ? `${activity.total_elevation_gain.toFixed(0)} m`
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
