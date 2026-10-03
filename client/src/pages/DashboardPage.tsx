import {
  KpiCard,
  BikeHero,
  MaintenanceAlerts,
  RecentActivities,
  WeeklyDistanceChart,
  BudgetSummary,
  GoalProgress,
  UpcomingEvents,
  TrainingLoadCard,
  useDashboardData,
} from '@/features/dashboard';
import { UpcomingWorkoutsWidget } from '@/features/training/components/UpcomingWorkoutsWidget';
import { formatDistance, formatIDR } from '@/shared/lib/utils';
import { Alert } from '@/components/ui/alert';
import { activeBudgetTotal, monthToDate } from '@/features/dashboard/lib/metrics';
import { Activity, Bike, Mountain, Route, Wallet } from 'lucide-react';

const RANGE_DAYS = 7;

export function DashboardPage() {
  const {
    stats,
    statsLoading,
    recentActivities,
    recentLoading,
    bikes,
    bikesLoading,
    dueSchedules,
    dueLoading,
    financeSummary,
    financeLoading,
    budgets,
    activeGoals,
    goalsLoading,
    upcomingEvents,
    eventsLoading,
    profile,
    profileLoading,
    loadHistory,
    loadHistoryLoading,
    fitness,
    fitnessLoading,
    error,
  } = useDashboardData();

  const current = stats.current;
  const previous = stats.previous;
  const currentMonth = monthToDate();
  const activeBikes = bikes.filter((b) => b.status === 'active').length;
  const alertBikes = bikes.filter(
    (b) => b.maintenance_alert_count && b.maintenance_alert_count > 0,
  ).length;
  const budgetLimit = budgets.length > 0 ? activeBudgetTotal(budgets) : null;
  const monthlySpent = financeSummary?.totalExpense ?? 0;
  const monthlyBalance = financeSummary
    ? financeSummary.totalIncome - financeSummary.totalExpense
    : null;

  return (
    <div className="space-y-6">
      <BikeHero
        displayName={profile?.display_name ?? null}
        bikes={bikes}
        defaultBikeId={profile?.default_bike_id ?? null}
        activityStats={current}
        loading={profileLoading || (statsLoading && bikes.length === 0)}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Distance (7d)"
          value={current ? formatDistance(current.totalDistance) : '—'}
          icon={<Route className="h-5 w-5" aria-hidden="true" />}
          loading={statsLoading}
          trend={
            current
              ? {
                  current: current.totalDistance,
                  previous: previous?.totalDistance ?? 0,
                  format: (v) => `${v.toFixed(1)} km`,
                }
              : undefined
          }
        />
        <KpiCard
          label="Rides (7d)"
          value={current ? String(current.count) : '—'}
          icon={<Activity className="h-5 w-5" aria-hidden="true" />}
          loading={statsLoading}
          trend={
            current
              ? {
                  current: current.count,
                  previous: previous?.count ?? 0,
                  format: (v) => `${v} ride${v === 1 ? '' : 's'}`,
                }
              : undefined
          }
        />
        <KpiCard
          label="Elevation (7d)"
          value={current ? `${current.totalElevationGain.toFixed(0)} m` : '—'}
          icon={<Mountain className="h-5 w-5" aria-hidden="true" />}
          loading={statsLoading}
          trend={
            current
              ? {
                  current: current.totalElevationGain,
                  previous: previous?.totalElevationGain ?? 0,
                  format: (v) => `${v.toFixed(0)} m`,
                }
              : undefined
          }
        />
        <KpiCard
          label="Active Bikes"
          value={String(activeBikes)}
          icon={<Bike className="h-5 w-5" aria-hidden="true" />}
          loading={bikesLoading}
          hint={bikesLoading ? undefined : `${bikes.length} total • ${alertBikes} need attention`}
        />
        <KpiCard
          label="Monthly Spend"
          value={formatIDR(monthlySpent)}
          icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
          loading={financeLoading}
          progress={{
            spent: monthlySpent,
            budget: budgetLimit,
            formatter: formatIDR,
          }}
          hint={
            monthlyBalance != null
              ? `Balance: ${formatIDR(monthlyBalance)} (${currentMonth.start} to ${currentMonth.end})`
              : undefined
          }
        />
      </div>

      <div className="space-y-3">
        {fitness?.warnings && fitness.warnings.length > 0 && (
          <Alert variant="warning">
            <p className="font-medium">Insights from your training</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {fitness.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
        <MaintenanceAlerts dueSchedules={dueSchedules} loading={dueLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TrainingLoadCard
            loadHistory={loadHistory}
            fitness={fitness}
            loading={loadHistoryLoading || fitnessLoading}
          />
          <WeeklyDistanceChart
            current={current}
            previous={previous}
            windowDays={RANGE_DAYS}
            loading={statsLoading}
          />
          <RecentActivities activities={recentActivities} loading={recentLoading} />
        </div>

        <div className="space-y-6">
          <GoalProgress goals={activeGoals} loading={goalsLoading} />
          <UpcomingWorkoutsWidget />
          <BudgetSummary summary={financeSummary} loading={financeLoading} />
          <UpcomingEvents events={upcomingEvents} loading={eventsLoading} />
        </div>
      </div>
    </div>
  );
}
