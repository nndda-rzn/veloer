import {
  ActivityList,
  ActivityFilters,
  ActivityStatsBar,
  useActivities,
} from '@/features/activity';
import { PageHeader } from '@/shared/components/ui';
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
          <button
            onClick={() => void sync()}
            disabled={syncLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {syncLoading ? 'Syncing...' : 'Sync Now'}
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {syncResult && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Sync complete — {syncResult.synced} new, {syncResult.skipped} already synced
          {syncResult.workoutsLinked > 0 && (
            <>
              , {syncResult.workoutsLinked} workout{syncResult.workoutsLinked !== 1 ? 's' : ''}{' '}
              linked
            </>
          )}{' '}
          (total: {syncResult.total})
        </div>
      )}

      <ActivityStatsBar stats={stats} loading={loading} />

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <ActivityFilters filters={filters} onChange={setFilters} />
      </div>

      <ActivityList activities={activities} loading={loading} />
    </div>
  );
}
