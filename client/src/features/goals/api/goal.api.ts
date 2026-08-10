import { apiClient } from '@/shared/lib/api-client';
import type { Goal, GoalFormData } from '../types/goal';

export const goalApi = {
  async list(active?: boolean): Promise<Goal[]> {
    const { data } = await apiClient.get<Goal[]>('/api/goals', {
      params: active !== undefined ? { active } : undefined,
    });
    return data;
  },

  async getById(id: string): Promise<Goal> {
    const { data } = await apiClient.get<Goal>(`/api/goals/${id}`);
    return data;
  },

  async create(formData: GoalFormData): Promise<Goal> {
    const { data } = await apiClient.post<Goal>('/api/goals', formData);
    return data;
  },

  async update(id: string, formData: Partial<GoalFormData>): Promise<Goal> {
    const { data } = await apiClient.patch<Goal>(`/api/goals/${id}`, formData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/goals/${id}`);
  },
};
