import { Link } from 'react-router-dom';
import { formatDistance, formatDate, formatActivityType } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bike } from 'lucide-react';
import { EmptyState } from '@/shared/components/ui';

interface RecentActivitiesProps {
  activities: { id: string; name: string; start_date: string; distance: number; type: string }[];
  loading: boolean;
}

export function RecentActivities({ activities, loading }: RecentActivitiesProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Bike}
        title="No activities yet"
        description="Sync from Strava to see your rides here."
      />
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-border">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary"
          >
            <div className="min-w-0 flex-1">
              <Link
                to={`/activities/${activity.id}`}
                className="truncate text-sm font-medium text-foreground hover:text-primary"
              >
                {activity.name}
              </Link>
              <p className="text-xs text-muted-foreground">{formatDate(activity.start_date)}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0 items-center gap-3">
              <Badge variant="neutral">{formatActivityType(activity.type)}</Badge>
              <span className="text-sm font-semibold text-foreground">
                {formatDistance(activity.distance)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-border px-4 py-2.5">
        <Link
          to="/activities"
          className="text-xs font-medium text-primary hover:text-primary-dark hover:underline"
        >
          View all activities →
        </Link>
      </div>
    </Card>
  );
}
