import { useEffect } from 'react';
import {
  ActivityList,
  ActivityFilters,
  ActivityStatsBar,
  useActivities,
  useSync,
} from '@/features/activity';
import { PageHeader } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export function ActivitiesPage() {
  const { activities, stats, loading, error, filters, setFilters, refetch } = useActivities();
  const { sync, isSyncing, lastResult, syncRevision } = useSync();

  useEffect(() => {
    if (syncRevision > 0) void refetch();
  }, [syncRevision, refetch]);

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
          Sync complete — {lastResult.synced} new, {lastResult.skipped} already synced
          {lastResult.workoutsLinked > 0 && (
            <>
              , {lastResult.workoutsLinked} workout
              {lastResult.workoutsLinked !== 1 ? 's' : ''} linked
            </>
          )}{' '}
          (total: {lastResult.total})
        </Alert>
      )}

      <ActivityStatsBar stats={stats} loading={loading} />

      <Card>
        <CardContent>
          <ActivityFilters filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      <ActivityList activities={activities} loading={loading} />
    </div>
  );
}
