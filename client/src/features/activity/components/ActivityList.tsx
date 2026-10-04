import { useMemo, useState } from 'react';
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
import { activityTypeAccent } from '../lib/activity-type-style';
import { groupByRelativeDate, tssTone, tssToneClass } from '../lib/activity-grouping';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bike, Rows3, CalendarDays } from 'lucide-react';
import { EmptyState, TableToolbar, SortableHead, TablePagination } from '@/shared/components/ui';

interface ActivityListProps {
  /** Activities already narrowed by the page-level date/type/bike filters. */
  activities: Activity[];
  loading: boolean;
}

type SortKey = 'date' | 'name' | 'distance' | 'duration' | 'elevation' | 'tss';

export function ActivityList({ activities, loading }: ActivityListProps) {
  const [grouped, setGrouped] = useState(false);

  const comparators = useMemo(
    () => ({
      date: (a: Activity, b: Activity) => a.start_date.localeCompare(b.start_date),
      name: (a: Activity, b: Activity) => a.name.localeCompare(b.name),
      distance: (a: Activity, b: Activity) => a.distance - b.distance,
      duration: (a: Activity, b: Activity) => a.moving_time - b.moving_time,
      elevation: (a: Activity, b: Activity) =>
        (a.total_elevation_gain ?? 0) - (b.total_elevation_gain ?? 0),
      tss: (a: Activity, b: Activity) => (a.tss ?? 0) - (b.tss ?? 0),
    }),
    [],
  );

  const table = useTableControls<Activity, SortKey>({
    rows: activities,
    searchText: (a) => `${a.name} ${a.type}`,
    comparators,
    initialSort: { key: 'date', dir: 'desc' },
  });

  const groups = useMemo(
    () => (grouped ? groupByRelativeDate(table.pageRows) : null),
    [grouped, table.pageRows],
  );

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

  const sortHead = (label: string, key: SortKey, align?: 'left' | 'right', className?: string) => (
    <SortableHead
      label={label}
      sortKey={key}
      activeKey={table.sort.key}
      dir={table.sort.dir}
      onToggle={(k) => table.toggleSort(k as SortKey)}
      align={align}
      className={className}
    />
  );

  return (
    <div className="space-y-3">
      <TableToolbar
        query={table.query}
        onQueryChange={table.setQuery}
        placeholder="Search activities…"
        filters={
          <Button
            variant={grouped ? 'secondary' : 'outline'}
            size="sm"
            aria-pressed={grouped}
            onClick={() => setGrouped((g) => !g)}
          >
            {grouped ? (
              <Rows3 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {grouped ? 'Flat list' : 'Group by date'}
          </Button>
        }
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
        <>
          {/* Desktop / tablet table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {sortHead('Date', 'date')}
                  {sortHead('Activity', 'name')}
                  {sortHead('Distance', 'distance', 'right')}
                  {sortHead('Duration', 'duration', 'right')}
                  <TableHead className="hidden text-right lg:table-cell">Avg Speed</TableHead>
                  {sortHead('Elevation', 'elevation', 'right', 'hidden lg:table-cell')}
                  {sortHead('Load', 'tss', 'right')}
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups
                  ? groups.map((group) => (
                      <GroupRows
                        key={group.key}
                        label={group.label}
                        activities={group.activities}
                      />
                    ))
                  : table.pageRows.map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} />
                    ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {groups
              ? groups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <p className="px-1 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </p>
                    {group.activities.map((a) => (
                      <ActivityCard key={a.id} activity={a} />
                    ))}
                  </div>
                ))
              : table.pageRows.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </div>
        </>
      )}

      <TablePagination page={table.page} pageCount={table.pageCount} onPageChange={table.setPage} />
    </div>
  );
}

function GroupRows({ label, activities }: { label: string; activities: Activity[] }) {
  return (
    <>
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={7} className="bg-secondary/60 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </TableCell>
      </TableRow>
      {activities.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </>
  );
}

function LoadBadge({ tss }: { tss: number | null }) {
  if (tss == null) return <span className="text-sm text-muted-foreground">–</span>;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
        tssToneClass[tssTone(tss)],
      )}
    >
      {tss.toFixed(0)}
    </span>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  const accent = activityTypeAccent(activity.type);
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDate(activity.start_date)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', accent.dot)} aria-hidden="true" />
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
      <TableCell className="hidden whitespace-nowrap text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
        {activity.avg_speed ? formatSpeed(activity.avg_speed) : '–'}
      </TableCell>
      <TableCell className="hidden whitespace-nowrap text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
        {activity.total_elevation_gain != null
          ? `${activity.total_elevation_gain.toFixed(0)} m`
          : '–'}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <LoadBadge tss={activity.tss} />
      </TableCell>
    </TableRow>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const accent = activityTypeAccent(activity.type);
  return (
    <Link
      to={`/activities/${activity.id}`}
      className="block rounded-xl border border-border bg-card p-3 transition-colors hover:border-stone-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', accent.dot)}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{activity.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(activity.start_date)} · {formatActivityType(activity.type)}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formatDistance(activity.distance)}
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {formatDuration(activity.moving_time)}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        {activity.avg_speed ? (
          <span className="tabular-nums">{formatSpeed(activity.avg_speed)}</span>
        ) : null}
        {activity.total_elevation_gain != null ? (
          <span className="tabular-nums">{activity.total_elevation_gain.toFixed(0)} m</span>
        ) : null}
        {activity.tss != null ? (
          <span className="ml-auto">
            <LoadBadge tss={activity.tss} />
          </span>
        ) : null}
      </div>
    </Link>
  );
}
