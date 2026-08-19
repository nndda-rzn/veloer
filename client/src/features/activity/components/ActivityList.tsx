import { Link } from 'react-router-dom';
import type { Activity } from '../types/activity';
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  formatDate,
  formatActivityType,
} from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Activity</TableHead>
          <TableHead className="text-right">Distance</TableHead>
          <TableHead className="text-right">Duration</TableHead>
          <TableHead className="hidden text-right md:table-cell">Avg Speed</TableHead>
          <TableHead className="hidden text-right md:table-cell">Elevation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell className="whitespace-nowrap text-xs text-gray-400">
              {formatDate(activity.start_date)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Link
                  to={`/activities/${activity.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary"
                >
                  {activity.name}
                </Link>
                <Badge variant="neutral">{formatActivityType(activity.type)}</Badge>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap text-right text-sm font-semibold tabular-nums text-gray-900">
              {formatDistance(activity.distance)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-right text-sm tabular-nums text-gray-500">
              {formatDuration(activity.moving_time)}
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-right text-sm tabular-nums text-gray-500 md:table-cell">
              {activity.avg_speed ? formatSpeed(activity.avg_speed) : '—'}
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-right text-sm tabular-nums text-gray-500 md:table-cell">
              {activity.total_elevation_gain != null
                ? `${activity.total_elevation_gain.toFixed(0)} m`
                : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
