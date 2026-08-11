import { useState, useCallback } from 'react';
import { trainingApi } from '../api/training.api';
import type { FitnessAnalysis } from '../types/training';

export function useFitnessAnalysis() {
  const [analysis, setAnalysis] = useState<FitnessAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await trainingApi.getFitnessAnalysis();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze fitness data');
    } finally {
      setLoading(false);
    }
  }, []);

  return { analysis, loading, error, analyze };
}
