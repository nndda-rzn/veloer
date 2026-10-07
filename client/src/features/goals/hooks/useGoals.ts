import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '../api/goal.api';
import type { Goal, GoalFormData, GoalUpdateData } from '../types/goal';

export const goalKeys = {
  all: ['goals'] as const,
};

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
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: goalKeys.all,
    queryFn: () => goalApi.list(),
  });

  // Any mutation re-reads the canonical list; Query owns the error state, so a
  // later success clears a prior failure instead of leaving it stuck on screen.
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: goalKeys.all }),
    [queryClient],
  );

  const createGoal = useCallback(
    async (data: GoalFormData) => {
      await goalApi.create(data);
      await invalidate();
    },
    [invalidate],
  );

  const updateGoal = useCallback(
    async (id: string, data: GoalUpdateData) => {
      await goalApi.update(id, data);
      await invalidate();
    },
    [invalidate],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      await goalApi.delete(id);
      await invalidate();
    },
    [invalidate],
  );

  const adjustProgress = useCallback(
    async (id: string, delta: number) => {
      await goalApi.adjustProgress(id, delta);
      await invalidate();
    },
    [invalidate],
  );

  const recalculate = useCallback(
    async (id: string) => {
      await goalApi.recalculate(id);
      await invalidate();
    },
    [invalidate],
  );

  const setStatus = useCallback(
    async (id: string, status: Goal['status']) => {
      await goalApi.update(id, { status });
      await invalidate();
    },
    [invalidate],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    goals: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
    adjustProgress,
    recalculate,
    setStatus,
  };
}
