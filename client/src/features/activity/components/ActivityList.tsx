import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Activity } from '../types/activity';
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  formatDate,
  formatActivityType,
} from '@/shared/lib/utils';
import { useTableControls } from '@/shared/lib/useTableControls';
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
import { EmptyState, TableToolbar, SortableHead, TablePagination } from '@/shared/components/ui';

interface ActivityListProps {
  /** Activities already narrowed by the page-level date/type/bike filters. */
  activities: Activity[];
  loading: boolean;
}

type SortKey = 'date' | 'name' | 'distance' | 'duration' | 'elevation';

export function ActivityList({ activities, loading }: ActivityListProps) {
  const comparators = useMemo(
    () => ({
      date: (a: Activity, b: Activity) => a.start_date.localeCompare(b.start_date),
      name: (a: Activity, b: Activity) => a.name.localeCompare(b.name),
      distance: (a: Activity, b: Activity) => a.distance - b.distance,
      duration: (a: Activity, b: Activity) => a.moving_time - b.moving_time,
      elevation: (a: Activity, b: Activity) =>
        (a.total_elevation_gain ?? 0) - (b.total_elevation_gain ?? 0),
    }),
    [],
  );

  const table = useTableControls<Activity, SortKey>({
    rows: activities,
    searchText: (a) => `${a.name} ${a.type}`,
    comparators,
    initialSort: { key: 'date', dir: 'desc' },
  });

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Bike}
        title="No activities in this range"
        description="Try a wider date range, or sync from Strava to pull in new rides."
      />
    );
  }

  return (
    <div className="space-y-3">
      <TableToolbar
        query={table.query}
        onQueryChange={table.setQuery}
        placeholder="Search activities…"
        rangeStart={table.rangeStart}
        rangeEnd={table.rangeEnd}
        total={table.total}
      />

      {table.total === 0 ? (
        <EmptyState
          icon={Bike}
          title="No matching activities"
          description="Try adjusting your search."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead
                label="Date"
                sortKey="date"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
              />
              <SortableHead
                label="Activity"
                sortKey="name"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
              />
              <SortableHead
                label="Distance"
                sortKey="distance"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
                align="right"
              />
              <SortableHead
                label="Duration"
                sortKey="duration"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
                align="right"
              />
              <TableHead className="hidden text-right md:table-cell">Avg Speed</TableHead>
              <SortableHead
                label="Elevation"
                sortKey="elevation"
                activeKey={table.sort.key}
                dir={table.sort.dir}
                onToggle={(k) => table.toggleSort(k as SortKey)}
                align="right"
                className="hidden md:table-cell"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.pageRows.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(activity.start_date)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/activities/${activity.id}`}
                      className="max-w-[24ch] truncate text-sm font-medium text-foreground hover:text-primary"
                    >
                      {activity.name}
                    </Link>
                    <Badge variant="neutral">{formatActivityType(activity.type)}</Badge>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-sm font-semibold tabular-nums text-foreground">
                  {formatDistance(activity.distance)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-sm tabular-nums text-muted-foreground">
                  {formatDuration(activity.moving_time)}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-right text-sm tabular-nums text-muted-foreground md:table-cell">
                  {activity.avg_speed ? formatSpeed(activity.avg_speed) : '–'}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-right text-sm tabular-nums text-muted-foreground md:table-cell">
                  {activity.total_elevation_gain != null
                    ? `${activity.total_elevation_gain.toFixed(0)} m`
                    : '–'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TablePagination page={table.page} pageCount={table.pageCount} onPageChange={table.setPage} />
    </div>
  );
}
