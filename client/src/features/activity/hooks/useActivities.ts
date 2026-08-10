import { useState, useEffect, useCallback } from 'react';
import { activityApi } from '../api/activity.api';
import type { Activity, ActivityStats, ActivityListFilters, SyncResult } from '../types/activity';

interface UseActivitiesReturn {
  activities: Activity[];
  stats: ActivityStats | null;
  loading: boolean;
  error: string | null;
  syncLoading: boolean;
  syncResult: SyncResult | null;
  filters: ActivityListFilters;
  setFilters: (filters: ActivityListFilters) => void;
  refetch: () => void;
  sync: () => Promise<void>;
}

export function useActivities(): UseActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [filters, setFilters] = useState<ActivityListFilters>({
    limit: 20,
    offset: 0,
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, statsData] = await Promise.all([
        activityApi.list(filters),
        activityApi.getStats(filters.startDate, filters.endDate),
      ]);
      setActivities(list);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const sync = useCallback(async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const result = await activityApi.sync();
      setSyncResult(result);
      await fetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncLoading(false);
    }
  }, [fetch]);

  return {
    activities,
    stats,
    loading,
    error,
    syncLoading,
    syncResult,
    filters,
    setFilters,
    refetch: fetch,
    sync,
  };
}
