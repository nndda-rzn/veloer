import { Link } from 'react-router-dom';
import { formatDistance, formatDate } from '@/shared/lib/utils';

interface RecentActivitiesProps {
  activities: { id: string; name: string; start_date: string; distance: number; type: string }[];
  loading: boolean;
}

export function RecentActivities({ activities, loading }: RecentActivitiesProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-500">
          No recent activities. Sync from Strava to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <ul className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <Link
                to={`/activities/${activity.id}`}
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                {activity.name}
              </Link>
              <p className="text-xs text-gray-400">{formatDate(activity.start_date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {activity.type}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatDistance(activity.distance)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
