import { useState, useEffect, useCallback } from 'react';
import { trainingApi } from '../api/training.api';
import type { TrainingWorkout, WorkoutFormData, WorkoutStatus } from '../types/training';

interface UseWorkoutsReturn {
  workouts: TrainingWorkout[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createWorkout: (data: WorkoutFormData) => Promise<TrainingWorkout>;
  updateWorkout: (workoutId: string, data: Partial<WorkoutFormData>) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  markStatus: (workoutId: string, status: WorkoutStatus) => Promise<void>;
  linkActivity: (workoutId: string, activityId: string) => Promise<void>;
  reschedule: () => Promise<void>;
}

export function useWorkouts(planId: string): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<TrainingWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    trainingApi
      .listWorkouts(planId)
      .then(setWorkouts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load workouts'))
      .finally(() => setLoading(false));
  }, [planId, refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createWorkout = useCallback(
    async (data: WorkoutFormData): Promise<TrainingWorkout> => {
      const workout = await trainingApi.createWorkout(planId, data);
      setRefetchFlag((f) => f + 1);
      return workout;
    },
    [planId],
  );

  const updateWorkout = useCallback(
    async (workoutId: string, data: Partial<WorkoutFormData>): Promise<void> => {
      await trainingApi.updateWorkout(planId, workoutId, data);
      setRefetchFlag((f) => f + 1);
    },
    [planId],
  );

  const deleteWorkout = useCallback(
    async (workoutId: string): Promise<void> => {
      await trainingApi.deleteWorkout(planId, workoutId);
      setRefetchFlag((f) => f + 1);
    },
    [planId],
  );

  const markStatus = useCallback(
    async (workoutId: string, status: WorkoutStatus): Promise<void> => {
      await trainingApi.updateWorkout(planId, workoutId, {
        status,
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      } as Partial<WorkoutFormData>);
      setRefetchFlag((f) => f + 1);
    },
    [planId],
  );

  const linkActivity = useCallback(
    async (workoutId: string, activityId: string): Promise<void> => {
      await trainingApi.updateWorkout(planId, workoutId, {
        actual_activity_id: activityId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      } as Partial<WorkoutFormData>);
      setRefetchFlag((f) => f + 1);
    },
    [planId],
  );

  const reschedule = useCallback(async (): Promise<void> => {
    await trainingApi.rescheduleMissed(planId);
    setRefetchFlag((f) => f + 1);
  }, [planId]);

  return {
    workouts,
    loading,
    error,
    refetch,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    markStatus,
    linkActivity,
    reschedule,
  };
}
