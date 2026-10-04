import {
  BikeHero,
  MomentumBar,
  TodayPanel,
  RecentActivities,
  BudgetSummary,
  GoalProgress,
  UpcomingEvents,
  TrainingLoadCard,
  useDashboardData,
  buildDashboardAlerts,
} from '@/features/dashboard';
import { UpcomingWorkoutsWidget } from '@/features/training/components/UpcomingWorkoutsWidget';
import { Alert } from '@/components/ui/alert';

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
  const monthlySpent = financeSummary?.totalExpense ?? 0;

  const alerts = buildDashboardAlerts({
    dueSchedules,
    bikes,
    goals: activeGoals,
    fitness,
    monthlySpent,
    budgets,
  });

  const alertsLoading =
    dueLoading || bikesLoading || goalsLoading || financeLoading || fitnessLoading;

  return (
    <div className="space-y-6">
      <BikeHero
        displayName={profile?.display_name ?? null}
        bikes={bikes}
        defaultBikeId={profile?.default_bike_id ?? null}
        loading={profileLoading || (statsLoading && bikes.length === 0)}
      />

      {error && <Alert variant="error">{error}</Alert>}

      {/* 1. What needs attention today, before any metrics. */}
      <TodayPanel alerts={alerts} loading={alertsLoading} />

      {/* 2. Where the rider is right now (last 7 days vs the 7 before). */}
      <MomentumBar
        current={current}
        previous={previous}
        windowDays={RANGE_DAYS}
        loading={statsLoading}
      />

      {/* 3. The detail: training load, recent rides, and the side panels. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TrainingLoadCard
            loadHistory={loadHistory}
            fitness={fitness}
            loading={loadHistoryLoading || fitnessLoading}
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
