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
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Distance"
          value={activityStats ? formatDistance(activityStats.totalDistance) : '—'}
          icon={<Route className="h-5 w-5" aria-hidden="true" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          trend={`${activityStats?.count ?? 0} activities`}
        />
        <KpiCard
          label="Total Time"
          value={
            activityStats
              ? `${Math.floor(activityStats.totalMovingTime / 3600)}h ${Math.floor((activityStats.totalMovingTime % 3600) / 60)}m`
              : '—'
          }
          icon={<Clock className="h-5 w-5" aria-hidden="true" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
        <KpiCard
          label="Active Bikes"
          value={String(activeBikes)}
          icon={<Bike className="h-5 w-5" aria-hidden="true" />}
          iconBg="bg-primary-50"
          iconColor="text-primary"
          trend={`${bikes.length} total`}
        />
        <KpiCard
          label="Budget Used"
          value={formatIDR(budgetUsed)}
          icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
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
        <div className="space-y-4 lg:col-span-2">
          <RecentActivities activities={recentActivities} loading={loading} />
          <WeeklyDistanceChart stats={activityStats} />
        </div>

        {/* Right — 1/3 width */}
        <div className="space-y-4">
          <GoalProgress goals={activeGoals} loading={loading} />
          <UpcomingEvents events={upcomingEvents} loading={loading} />
          <UpcomingWorkoutsWidget />
          <BudgetSummary summary={financeSummary} loading={loading} />
        </div>
      </div>
    </div>
  );
}
