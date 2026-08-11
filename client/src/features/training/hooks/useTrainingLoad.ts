import { useState, useEffect } from 'react';
import { trainingApi } from '../api/training.api';
import type { TrainingLoadDataPoint } from '../types/training';

export function useTrainingLoad() {
  const [data, setData] = useState<TrainingLoadDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trainingApi
      .getLoadHistory()
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load training history'),
      )
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
