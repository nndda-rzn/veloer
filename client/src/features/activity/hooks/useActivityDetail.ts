import { useState, useEffect } from 'react';
import { activityApi } from '../api/activity.api';
import type { Activity } from '../types/activity';

interface UseActivityDetailReturn {
  activity: Activity | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActivityDetail(id: string | undefined): UseActivityDetailReturn {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    if (!id) {
      setActivity(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    activityApi
      .getById(id)
      .then((data) => setActivity(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load activity'))
      .finally(() => setLoading(false));
  }, [id, refetchFlag]);

  return {
    activity,
    loading,
    error,
    refetch: () => setRefetchFlag((f) => f + 1),
  };
}
