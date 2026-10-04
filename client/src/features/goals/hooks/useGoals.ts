import { useState, useEffect, useCallback } from 'react';
import { goalApi } from '../api/goal.api';
import type { Goal, GoalFormData, GoalUpdateData } from '../types/goal';

interface UseGoalsReturn {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createGoal: (data: GoalFormData) => Promise<void>;
  updateGoal: (id: string, data: GoalUpdateData) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  adjustProgress: (id: string, delta: number) => Promise<void>;
  recalculate: (id: string) => Promise<void>;
  setStatus: (id: string, status: Goal['status']) => Promise<void>;
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

  const updateGoal = useCallback(async (id: string, data: GoalUpdateData) => {
    await goalApi.update(id, data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await goalApi.delete(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  const adjustProgress = useCallback(async (id: string, delta: number) => {
    await goalApi.adjustProgress(id, delta);
    setRefetchFlag((f) => f + 1);
  }, []);

  const recalculate = useCallback(async (id: string) => {
    await goalApi.recalculate(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  const setStatus = useCallback(async (id: string, status: Goal['status']) => {
    await goalApi.update(id, { status });
    setRefetchFlag((f) => f + 1);
  }, []);

  return {
    goals,
    loading,
    error,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
    adjustProgress,
    recalculate,
    setStatus,
  };
}
