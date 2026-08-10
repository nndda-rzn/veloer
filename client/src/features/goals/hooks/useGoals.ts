import { useState, useEffect, useCallback } from 'react';
import { goalApi } from '../api/goal.api';
import type { Goal, GoalFormData } from '../types/goal';

interface UseGoalsReturn {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createGoal: (data: GoalFormData) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    setLoading(true);
    goalApi
      .list()
      .then(setGoals)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load goals'))
      .finally(() => setLoading(false));
  }, [refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createGoal = useCallback(async (data: GoalFormData) => {
    await goalApi.create(data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await goalApi.delete(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  return { goals, loading, error, refetch, createGoal, deleteGoal };
}
