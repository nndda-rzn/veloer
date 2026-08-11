import { apiClient } from '@/shared/lib/api-client';
import type {
  TrainingPlan,
  TrainingWorkout,
  TrainingPlanFormData,
  WorkoutFormData,
  WorkoutRecommendation,
  PlanRetrospective,
  TrainingLoadDataPoint,
} from '../types/training';

export const trainingApi = {
  // ---- Plans ----
  async listPlans(): Promise<TrainingPlan[]> {
    const { data } = await apiClient.get<TrainingPlan[]>('/api/training-plans');
    return data;
  },

  async getPlanById(id: string): Promise<TrainingPlan> {
    const { data } = await apiClient.get<TrainingPlan>(`/api/training-plans/${id}`);
    return data;
  },

  async createPlan(formData: TrainingPlanFormData): Promise<TrainingPlan> {
    const { data } = await apiClient.post<TrainingPlan>('/api/training-plans', formData);
    return data;
  },

  async updatePlan(id: string, formData: Partial<TrainingPlanFormData>): Promise<TrainingPlan> {
    const { data } = await apiClient.patch<TrainingPlan>(`/api/training-plans/${id}`, formData);
    return data;
  },

  async deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/api/training-plans/${id}`);
  },

  // ---- Workouts ----
  async listWorkouts(planId: string): Promise<TrainingWorkout[]> {
    const { data } = await apiClient.get<TrainingWorkout[]>(
      `/api/training-plans/${planId}/workouts`,
    );
    return data;
  },

  async createWorkout(planId: string, formData: WorkoutFormData): Promise<TrainingWorkout> {
    const { data } = await apiClient.post<TrainingWorkout>(
      `/api/training-plans/${planId}/workouts`,
      formData,
    );
    return data;
  },

  async updateWorkout(
    planId: string,
    workoutId: string,
    formData: Partial<WorkoutFormData>,
  ): Promise<TrainingWorkout> {
    const { data } = await apiClient.patch<TrainingWorkout>(
      `/api/training-plans/${planId}/workouts/${workoutId}`,
      formData,
    );
    return data;
  },

  async deleteWorkout(planId: string, workoutId: string): Promise<void> {
    await apiClient.delete(`/api/training-plans/${planId}/workouts/${workoutId}`);
  },

  // ---- Recommendation ----
  async getRecommendation(): Promise<WorkoutRecommendation> {
    const { data } = await apiClient.get<WorkoutRecommendation>(
      '/api/training-plans/recommendations',
    );
    return data;
  },

  // ---- Retrospective ----
  async getRetrospective(planId: string): Promise<PlanRetrospective> {
    const { data } = await apiClient.get<PlanRetrospective>(
      `/api/training-plans/${planId}/retrospective`,
    );
    return data;
  },

  // ---- Reschedule missed ----
  async rescheduleMissed(planId: string): Promise<{ missed: number; rescheduled: number }> {
    const { data } = await apiClient.post<{ missed: number; rescheduled: number }>(
      `/api/training-plans/${planId}/reschedule-missed`,
    );
    return data;
  },

  // ---- Load History ----
  async getLoadHistory(): Promise<TrainingLoadDataPoint[]> {
    const { data } = await apiClient.get<TrainingLoadDataPoint[]>(
      '/api/training-plans/load-history',
    );
    return data;
  },

  // ---- From template ----
  async createFromTemplate(params: {
    template: string;
    start_date: string;
    title?: string;
  }): Promise<TrainingPlan> {
    const { data } = await apiClient.post<TrainingPlan>(
      '/api/training-plans/from-template',
      params,
    );
    return data;
  },
};
