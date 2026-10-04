import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    activityApi
      .list({ limit: ACTIVITY_FETCH_LIMIT })
      .then((list) => {
        if (active) setActivities(list);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load activities');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  return {
    activities,
    loading,
    error,
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
