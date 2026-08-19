import {
  ActivityList,
  ActivityFilters,
  ActivityStatsBar,
  useActivities,
} from '@/features/activity';
import { PageHeader, Button, Alert } from '@/shared/components/ui';
import { RefreshCw } from 'lucide-react';

export function ActivitiesPage() {
  const { activities, stats, loading, error, syncLoading, syncResult, filters, setFilters, sync } =
    useActivities();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="Your cycling activities synced from Strava"
        action={
          <Button onClick={() => void sync()} loading={syncLoading}>
            <RefreshCw
              className={`h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {syncLoading ? 'Syncing...' : 'Sync Now'}
          </Button>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      {syncResult && (
        <Alert variant="success">
          Sync complete — {syncResult.synced} new, {syncResult.skipped} already synced
          {syncResult.workoutsLinked > 0 && (
            <>
              , {syncResult.workoutsLinked} workout{syncResult.workoutsLinked !== 1 ? 's' : ''}{' '}
              linked
            </>
          )}{' '}
          (total: {syncResult.total})
        </Alert>
      )}

      <ActivityStatsBar stats={stats} loading={loading} />

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <ActivityFilters filters={filters} onChange={setFilters} />
      </div>

      <ActivityList activities={activities} loading={loading} />
    </div>
  );
}
