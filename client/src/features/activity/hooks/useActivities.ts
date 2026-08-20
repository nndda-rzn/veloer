import { useState, useEffect, useCallback } from 'react';
import { activityApi } from '../api/activity.api';
import type { Activity, ActivityStats, ActivityListFilters } from '../types/activity';

interface UseActivitiesReturn {
  activities: Activity[];
  stats: ActivityStats | null;
  loading: boolean;
  error: string | null;
  filters: ActivityListFilters;
  setFilters: (filters: ActivityListFilters) => void;
  refetch: () => void;
}

export function useActivities(): UseActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  return {
    activities,
    stats,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetch,
  };
}
