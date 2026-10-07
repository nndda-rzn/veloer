import { useState, useEffect } from 'react';
import { trainingApi } from '../api/training.api';
import type { WorkoutRecommendation } from '../types/training';

export function useRecommendation(date?: string) {
  const [recommendation, setRecommendation] = useState<WorkoutRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    trainingApi
      .getRecommendation(date)
      .then(setRecommendation)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load recommendation'),
      )
      .finally(() => setLoading(false));
  }, [date]);

  return { recommendation, loading, error };
}
