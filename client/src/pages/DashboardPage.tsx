import {
  KpiCard,
  BikeHero,
  MaintenanceAlerts,
  RecentActivities,
  WeeklyDistanceChart,
  BudgetSummary,
  GoalProgress,
  UpcomingEvents,
  useDashboardData,
} from '@/features/dashboard';
import { UpcomingWorkoutsWidget } from '@/features/training/components/UpcomingWorkoutsWidget';
import { formatDistance, formatIDR } from '@/shared/lib/utils';
import { Route, Clock, Bike, Wallet } from 'lucide-react';

export function DashboardPage() {
  const {
    activityStats,
    recentActivities,
    bikes,
    dueSchedules,
    financeSummary,
    activeGoals,
    upcomingEvents,
    profile,
    loading,
    error,
  } = useDashboardData();

  const activeBikes = bikes.filter((b) => b.status === 'active').length;
  const budgetUsed = financeSummary?.totalExpense ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <BikeHero
        displayName={profile?.display_name ?? null}
        bikes={bikes}
        defaultBikeId={profile?.default_bike_id ?? null}
        activityStats={activityStats}
      />

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
          icon={<Route className="h-5 w-5" />}
          iconColor="bg-blue-500"
          trend={`${activityStats?.count ?? 0} activities`}
        />
        <KpiCard
          label="Total Time"
          value={
            activityStats
              ? `${Math.floor(activityStats.totalMovingTime / 3600)}h ${Math.floor((activityStats.totalMovingTime % 3600) / 60)}m`
              : '—'
          }
          icon={<Clock className="h-5 w-5" />}
          iconColor="bg-green-500"
        />
        <KpiCard
          label="Active Bikes"
          value={String(activeBikes)}
          icon={<Bike className="h-5 w-5" />}
          iconColor="bg-purple-500"
          trend={`${bikes.length} total`}
        />
        <KpiCard
          label="Budget Used"
          value={formatIDR(budgetUsed)}
          icon={<Wallet className="h-5 w-5" />}
          iconColor="bg-orange-500"
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
        {/* Left — 2/3 width */}
        <div className="space-y-3 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700">Recent Activities</h3>
          <RecentActivities activities={recentActivities} loading={loading} />
          <WeeklyDistanceChart stats={activityStats} />
        </div>

        {/* Right — 1/3 width */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Goals</h3>
          <GoalProgress goals={activeGoals} loading={loading} />
          <h3 className="pt-2 text-sm font-semibold text-gray-700">Events</h3>
          <UpcomingEvents events={upcomingEvents} loading={loading} />
          <h3 className="pt-2 text-sm font-semibold text-gray-700">Training Plan</h3>
          <UpcomingWorkoutsWidget />
          <h3 className="pt-2 text-sm font-semibold text-gray-700">Finance</h3>
          <BudgetSummary summary={financeSummary} loading={loading} />
        </div>
      </div>
    </div>
  );
}
