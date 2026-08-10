import {
  ActivityList,
  ActivityFilters,
  ActivityStatsBar,
  useActivities,
} from '@/features/activity';

export function ActivitiesPage() {
  const { activities, stats, loading, error, syncLoading, syncResult, filters, setFilters, sync } =
    useActivities();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
          <p className="mt-1 text-sm text-gray-500">Your cycling activities synced from Strava</p>
        </div>
        <button
          onClick={() => void sync()}
          disabled={syncLoading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncLoading ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {syncResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Sync complete — {syncResult.synced} new, {syncResult.skipped} already synced (total:{' '}
          {syncResult.total})
        </div>
      )}

      <ActivityStatsBar stats={stats} loading={loading} />

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <ActivityFilters filters={filters} onChange={setFilters} />
      </div>

      <ActivityList activities={activities} loading={loading} />
    </div>
  );
}
