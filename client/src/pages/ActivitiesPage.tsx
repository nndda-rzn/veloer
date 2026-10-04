import { useEffect, useMemo, useState } from 'react';
import {
  ActivityList,
  ActivityFilters,
  ActivityStatsBar,
  ActivityVolumeSparkline,
  useActivities,
  useActivityQuery,
  useSync,
} from '@/features/activity';
import type { ActivityQuery } from '@/features/activity';
import { bikeApi } from '@/features/inventory';
import { PageHeader } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

const initialQuery: ActivityQuery = {
  preset: '30d',
  range: { start: '', end: '' },
  type: 'all',
  bikeId: 'all',
  discipline: 'all',
};

export function ActivitiesPage() {
  const { activities, loading, error, truncated, refetch } = useActivities();
  const { sync, isSyncing, lastResult, syncRevision } = useSync();
  const [query, setQuery] = useState<ActivityQuery>(initialQuery);
  const [bikeNames, setBikeNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (syncRevision > 0) void refetch();
  }, [syncRevision, refetch]);

  useEffect(() => {
    bikeApi
      .list()
      .then((bikes) => setBikeNames(Object.fromEntries(bikes.map((b) => [b.id, b.name]))))
      .catch(() => undefined);
  }, []);

  const result = useActivityQuery(activities, query);

  const types = useMemo(() => [...new Set(activities.map((a) => a.type))].sort(), [activities]);

  const bikes = useMemo(() => {
    const ids = [...new Set(activities.map((a) => a.bike_id).filter((id): id is string => !!id))];
    return ids.map((id) => ({ id, name: bikeNames[id] ?? 'Unnamed bike' }));
  }, [activities, bikeNames]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="Your cycling activities synced from Strava"
        action={
          <Button onClick={() => void sync().catch(() => undefined)} loading={isSyncing}>
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isSyncing ? 'Syncing…' : 'Sync Now'}
          </Button>
        }
      />

      {error && (
        <Alert variant="error" live="assertive">
          {error}
        </Alert>
      )}

      {lastResult && (
        <Alert variant="success" live="polite">
          Sync complete · {lastResult.synced} new, {lastResult.skipped} already synced
          {lastResult.workoutsLinked > 0 && (
            <>
              , {lastResult.workoutsLinked} workout
              {lastResult.workoutsLinked !== 1 ? 's' : ''} linked
            </>
          )}{' '}
          (total: {lastResult.total})
        </Alert>
      )}

      {truncated && (
        <Alert variant="warning" live="polite">
          Showing the most recent {activities.length} activities. Older rides are not included.
        </Alert>
      )}

      <ActivityStatsBar summary={result.summary} previous={result.previous} loading={loading} />

      {!loading && activities.length > 0 && <ActivityVolumeSparkline activities={activities} />}

      <Card>
        <CardContent>
          <ActivityFilters query={query} onChange={setQuery} types={types} bikes={bikes} />
        </CardContent>
      </Card>

      <ActivityList activities={result.rows} loading={loading} />
    </div>
  );
}
