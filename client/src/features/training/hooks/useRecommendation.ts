import { useState, useEffect } from 'react';
import { trainingApi } from '../api/training.api';
import type { WorkoutRecommendation } from '../types/training';

export function useRecommendation() {
  const [recommendation, setRecommendation] = useState<WorkoutRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trainingApi
      .getRecommendation()
      .then(setRecommendation)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load recommendation'),
      )
      .finally(() => setLoading(false));
  }, []);

  return { recommendation, loading, error };
}
