import {
  KpiCard,
  MaintenanceAlerts,
  RecentActivities,
  WeeklyDistanceChart,
  BudgetSummary,
  useDashboardData,
} from '@/features/dashboard';
import { formatDistance, formatIDR } from '@/shared/lib/utils';

export function DashboardPage() {
  const { activityStats, recentActivities, bikes, dueSchedules, financeSummary, loading, error } =
    useDashboardData();

  const activeBikes = bikes.filter((b) => b.status === 'active').length;
  const budgetUsed = financeSummary?.totalExpense ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of your cycling activities and gear</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Distance"
          value={activityStats ? formatDistance(activityStats.totalDistance) : '—'}
          icon="🚴"
          trend={`${activityStats?.count ?? 0} activities`}
        />
        <KpiCard
          label="Total Time"
          value={
            activityStats
              ? `${Math.floor(activityStats.totalMovingTime / 3600)}h ${Math.floor((activityStats.totalMovingTime % 3600) / 60)}m`
              : '—'
          }
          icon="⏱️"
        />
        <KpiCard
          label="Active Bikes"
          value={String(activeBikes)}
          icon="🚲"
          trend={`${bikes.length} total`}
        />
        <KpiCard
          label="Budget Used"
          value={formatIDR(budgetUsed)}
          icon="💰"
          trend={
            financeSummary
              ? `Balance: ${formatIDR(financeSummary.totalIncome - financeSummary.totalExpense)}`
              : ''
          }
        />
      </div>

      {/* Alerts */}
      <MaintenanceAlerts dueSchedules={dueSchedules} loading={loading} />

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activities — 2/3 width */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Recent Activities</h3>
          <RecentActivities activities={recentActivities} loading={loading} />
          <WeeklyDistanceChart stats={activityStats} />
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Finance</h3>
          <BudgetSummary summary={financeSummary} loading={loading} />
        </div>
      </div>
    </div>
  );
}
