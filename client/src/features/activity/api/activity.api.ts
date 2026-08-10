import { apiClient } from '@/shared/lib/api-client';
import type { Activity, ActivityStats, ActivityListFilters, SyncResult } from '../types/activity';

export const activityApi = {
  async list(filters?: ActivityListFilters): Promise<Activity[]> {
    const { data } = await apiClient.get<Activity[]>('/api/activities', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Activity> {
    const { data } = await apiClient.get<Activity>(`/api/activities/${id}`);
    return data;
  },

  async getStats(startDate?: string, endDate?: string): Promise<ActivityStats> {
    const { data } = await apiClient.get<ActivityStats>('/api/activities/stats', {
      params: { startDate, endDate },
    });
    return data;
  },

  async sync(): Promise<SyncResult> {
    const { data } = await apiClient.post<SyncResult>('/api/sync');
    return data;
  },

  async updateBike(id: string, bikeId: string | null): Promise<void> {
    await apiClient.patch(`/api/activities/${id}/bike`, { bikeId });
  },
};
