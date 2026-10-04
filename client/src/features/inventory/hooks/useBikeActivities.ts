import { useEffect, useMemo, useState } from 'react';
import { activityApi } from '@/features/activity';
import type { Activity } from '@/features/activity';

interface UseBikeActivitiesReturn {
  activities: Activity[];
  loading: boolean;
}

/**
 * Loads the activities linked to a bike. Used to estimate the recent riding
 * rate for component wear projections. Fails silently (empty list) so the
 * detail page still renders without activity data.
 */
export function useBikeActivities(bikeId: string | undefined): UseBikeActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bikeId) {
      setActivities([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    activityApi
      .list({ bikeId, limit: 500 })
      .then((data) => {
        if (active) setActivities(data);
      })
      .catch(() => {
        if (active) setActivities([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bikeId]);

  return useMemo(() => ({ activities, loading }), [activities, loading]);
}
