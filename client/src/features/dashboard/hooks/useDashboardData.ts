import { useState, useEffect } from 'react';
import { activityApi } from '@/features/activity';
import { bikeApi } from '@/features/inventory';
import { maintenanceApi } from '@/features/maintenance';
import { financeApi } from '@/features/finance';
import type { ActivityStats } from '@/features/activity';
import type { Bike } from '@/features/inventory';
import type { MaintenanceSchedule } from '@/features/maintenance';
import type { FinanceSummary } from '@/features/finance';

export interface DashboardData {
  activityStats: ActivityStats | null;
  recentActivities: {
    id: string;
    name: string;
    start_date: string;
    distance: number;
    type: string;
  }[];
  bikes: Bike[];
  dueSchedules: MaintenanceSchedule[];
  financeSummary: FinanceSummary | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<
    { id: string; name: string; start_date: string; distance: number; type: string }[]
  >([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [dueSchedules, setDueSchedules] = useState<MaintenanceSchedule[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      activityApi.getStats(),
      activityApi.list({ limit: 5 }),
      bikeApi.list(),
      maintenanceApi.getDueSchedules(),
      financeApi.getSummary(),
    ])
      .then(([stats, activities, bikeList, due, finance]) => {
        setActivityStats(stats);
        setRecentActivities(activities);
        setBikes(bikeList);
        setDueSchedules(due);
        setFinanceSummary(finance);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return {
    activityStats,
    recentActivities,
    bikes,
    dueSchedules,
    financeSummary,
    loading,
    error,
  };
}
