import { useState, useEffect, useCallback } from 'react';
import { trainingApi } from '../api/training.api';
import type { TrainingPlan, TrainingPlanFormData } from '../types/training';

interface UsePlansReturn {
  plans: TrainingPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createPlan: (data: TrainingPlanFormData) => Promise<TrainingPlan>;
  updatePlan: (id: string, data: Partial<TrainingPlanFormData>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

export function usePlans(): UsePlansReturn {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    setLoading(true);
    trainingApi
      .listPlans()
      .then(setPlans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plans'))
      .finally(() => setLoading(false));
  }, [refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createPlan = useCallback(async (data: TrainingPlanFormData): Promise<TrainingPlan> => {
    const plan = await trainingApi.createPlan(data);
    setRefetchFlag((f) => f + 1);
    return plan;
  }, []);

  const updatePlan = useCallback(
    async (id: string, data: Partial<TrainingPlanFormData>): Promise<void> => {
      await trainingApi.updatePlan(id, data);
      setRefetchFlag((f) => f + 1);
    },
    [],
  );

  const deletePlan = useCallback(async (id: string): Promise<void> => {
    await trainingApi.deletePlan(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  return { plans, loading, error, refetch, createPlan, updatePlan, deletePlan };
}
