import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/features/activity';
import { bikeApi } from '@/features/inventory';
import { maintenanceApi } from '@/features/maintenance';
import { financeApi } from '@/features/finance';
import { goalApi } from '@/features/goals';
import { eventApi } from '@/features/events';
import { settingsApi } from '@/features/settings';
import { trainingApi } from '@/features/training';
import type { Activity, ActivityStats } from '@/features/activity';
import type { Bike } from '@/features/inventory';
import type { MaintenanceSchedule } from '@/features/maintenance';
import type { Budget, FinanceSummary } from '@/features/finance';
import type { Goal } from '@/features/goals';
import type { Event } from '@/features/events';
import type { UserProfile } from '@/features/settings';
import type { FitnessAnalysis, TrainingLoadDataPoint } from '@/features/training';
import { lastDaysNDays, monthToDate, previousRange } from '../lib/metrics';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (range: { start: string; end: string }) => ['dashboard', 'stats', range] as const,
  recent: ['dashboard', 'recent'] as const,
  bikes: ['dashboard', 'bikes'] as const,
  due: ['dashboard', 'due'] as const,
  finance: ['dashboard', 'finance'] as const,
  budgets: ['dashboard', 'budgets'] as const,
  goals: ['dashboard', 'goals'] as const,
  events: ['dashboard', 'events'] as const,
  profile: ['dashboard', 'profile'] as const,
  loadHistory: ['dashboard', 'load'] as const,
  fitness: ['dashboard', 'fitness'] as const,
};

const RANGE_DAYS = 7;
const RECENT_LIMIT = 5;

export interface UseDashboardData {
  stats: { current: ActivityStats | null; previous: ActivityStats | null };
  statsLoading: boolean;
  recentActivities: Pick<Activity, 'id' | 'name' | 'start_date' | 'distance' | 'type'>[];
  recentLoading: boolean;
  bikes: Bike[];
  bikesLoading: boolean;
  dueSchedules: MaintenanceSchedule[];
  dueLoading: boolean;
  financeSummary: FinanceSummary | null;
  financeLoading: boolean;
  budgets: Budget[];
  budgetsLoading: boolean;
  activeGoals: Goal[];
  goalsLoading: boolean;
  upcomingEvents: Event[];
  eventsLoading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  loadHistory: TrainingLoadDataPoint[];
  loadHistoryLoading: boolean;
  fitness: FitnessAnalysis | null;
  fitnessLoading: boolean;
  initialLoading: boolean;
  error: string | null;
}

export function useDashboardData(): UseDashboardData {
  const currentRange = lastDaysNDays(RANGE_DAYS);
  const prevRange = previousRange(currentRange, RANGE_DAYS);
  const financeRange = monthToDate();

  const statsQuery = useQuery({
    queryKey: dashboardKeys.stats(currentRange),
    queryFn: () => activityApi.getStats(currentRange.start, currentRange.end),
  });
  const statsPrevQuery = useQuery({
    queryKey: dashboardKeys.stats(prevRange),
    queryFn: () => activityApi.getStats(prevRange.start, prevRange.end),
  });
  const recentQuery = useQuery({
    queryKey: dashboardKeys.recent,
    queryFn: () => activityApi.list({ limit: RECENT_LIMIT }),
    select: (activities) => activities.map(toRecent),
  });
  const bikesQuery = useQuery({
    queryKey: dashboardKeys.bikes,
    queryFn: () => bikeApi.list(),
  });
  const dueQuery = useQuery({
    queryKey: dashboardKeys.due,
    queryFn: () => maintenanceApi.getDueSchedules(),
  });
  const financeQuery = useQuery({
    queryKey: dashboardKeys.finance,
    queryFn: () => financeApi.getSummary(financeRange.start, financeRange.end),
    staleTime: 1000 * 60 * 10,
  });
  const budgetsQuery = useQuery({
    queryKey: dashboardKeys.budgets,
    queryFn: () => financeApi.listBudgets(),
  });
  const goalsQuery = useQuery({
    queryKey: dashboardKeys.goals,
    queryFn: () => goalApi.list(true),
  });
  const eventsQuery = useQuery({
    queryKey: dashboardKeys.events,
    queryFn: () => eventApi.list(true),
  });
  const profileQuery = useQuery({
    queryKey: dashboardKeys.profile,
    queryFn: () => settingsApi.getProfile(),
  });
  const loadHistoryQuery = useQuery({
    queryKey: dashboardKeys.loadHistory,
    queryFn: () => trainingApi.getLoadHistory(),
    staleTime: 1000 * 60 * 10,
  });
  const fitnessQuery = useQuery({
    queryKey: dashboardKeys.fitness,
    queryFn: () => trainingApi.getFitnessAnalysis(),
    staleTime: 1000 * 60 * 10,
  });

  const queryErrors = [
    statsQuery.error,
    recentQuery.error,
    bikesQuery.error,
    dueQuery.error,
    financeQuery.error,
    goalsQuery.error,
    eventsQuery.error,
    profileQuery.error,
  ].filter(Boolean);

  return {
    stats: {
      current: statsQuery.data ?? null,
      previous: statsPrevQuery.data ?? null,
    },
    statsLoading: statsQuery.isLoading,
    recentActivities: recentQuery.data ?? [],
    recentLoading: recentQuery.isLoading,
    bikes: bikesQuery.data ?? [],
    bikesLoading: bikesQuery.isLoading,
    dueSchedules: dueQuery.data ?? [],
    dueLoading: dueQuery.isLoading,
    financeSummary: financeQuery.data ?? null,
    financeLoading: financeQuery.isLoading,
    budgets: budgetsQuery.data ?? [],
    budgetsLoading: budgetsQuery.isLoading,
    activeGoals: goalsQuery.data ?? [],
    goalsLoading: goalsQuery.isLoading,
    upcomingEvents: eventsQuery.data ?? [],
    eventsLoading: eventsQuery.isLoading,
    profile: profileQuery.data ?? null,
    profileLoading: profileQuery.isLoading,
    loadHistory: loadHistoryQuery.data ?? [],
    loadHistoryLoading: loadHistoryQuery.isLoading,
    fitness: fitnessQuery.data ?? null,
    fitnessLoading: fitnessQuery.isLoading,
    initialLoading:
      statsQuery.isLoading &&
      recentQuery.isLoading &&
      bikesQuery.isLoading &&
      profileQuery.isLoading,
    error:
      queryErrors.length > 0
        ? 'Some dashboard data could not be loaded. Refresh to try again.'
        : null,
  };
}

interface RecentActivitySlim {
  id: string;
  name: string;
  start_date: string;
  distance: number;
  type: string;
}

function toRecent(a: Activity): RecentActivitySlim {
  return { id: a.id, name: a.name, start_date: a.start_date, distance: a.distance, type: a.type };
}

export type { RecentActivitySlim };
