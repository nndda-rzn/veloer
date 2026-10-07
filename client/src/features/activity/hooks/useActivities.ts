import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../api/activity.api';
import type { Activity } from '../types/activity';
import {
  filterActivities,
  type ActivityQuery,
  type ActivityQueryResult,
} from '../lib/activity-filters';

/**
 * Upper bound for the "load everything" list query. High enough that a normal
 * rider never hits it, low enough to stay a sane payload.
 */
export const ACTIVITY_FETCH_LIMIT = 2000;

export const activityKeys = {
  all: ['activities'] as const,
  detail: (id: string) => ['activities', id] as const,
};

interface UseActivitiesReturn {
  /** Every activity on record, newest first. */
  activities: Activity[];
  loading: boolean;
  error: string | null;
  /** True when the record count reached the fetch cap (data may be truncated). */
  truncated: boolean;
  refetch: () => void;
}

export function useActivities(): UseActivitiesReturn {
  const query = useQuery({
    queryKey: activityKeys.all,
    queryFn: () => activityApi.list({ limit: ACTIVITY_FETCH_LIMIT }),
  });

  // Stable identity so consumers can depend on it without re-render churn.
  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  const activities = query.data ?? [];

  return {
    activities,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    truncated: activities.length >= ACTIVITY_FETCH_LIMIT,
    refetch,
  };
}

/**
 * Derive the filtered rows and summaries for a query from the full activity
 * list. Pure and synchronous: switching presets or filters never refetches.
 */
export function useActivityQuery(
  activities: Activity[],
  query: ActivityQuery,
): ActivityQueryResult {
  return useMemo(() => filterActivities(activities, query), [activities, query]);
}
