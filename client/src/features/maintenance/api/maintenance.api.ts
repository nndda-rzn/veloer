import { apiClient } from '@/shared/lib/api-client';
import type {
  MaintenanceLog,
  MaintenanceSchedule,
  MaintenanceLogFormData,
  ScheduleFormData,
} from '../types/maintenance';

export const maintenanceApi = {
  // Logs
  async listLogs(bikeId: string): Promise<MaintenanceLog[]> {
    const { data } = await apiClient.get<MaintenanceLog[]>(`/api/maintenance/${bikeId}/logs`);
    return data;
  },

  async createLog(formData: MaintenanceLogFormData): Promise<MaintenanceLog> {
    const { data } = await apiClient.post<MaintenanceLog>(
      `/api/maintenance/${formData.bike_id}/logs`,
      formData,
    );
    return data;
  },

  async deleteLog(id: string): Promise<void> {
    await apiClient.delete(`/api/maintenance/logs/${id}`);
  },

  // Schedules
  async listSchedules(bikeId: string): Promise<MaintenanceSchedule[]> {
    const { data } = await apiClient.get<MaintenanceSchedule[]>(
      `/api/maintenance/${bikeId}/schedules`,
    );
    return data;
  },

  async createSchedule(bikeId: string, formData: ScheduleFormData): Promise<MaintenanceSchedule> {
    const { data } = await apiClient.post<MaintenanceSchedule>(
      `/api/maintenance/${bikeId}/schedules`,
      formData,
    );
    return data;
  },

  async updateSchedule(
    id: string,
    data: Partial<MaintenanceSchedule>,
  ): Promise<MaintenanceSchedule> {
    const { data: result } = await apiClient.patch<MaintenanceSchedule>(
      `/api/maintenance/schedules/${id}`,
      data,
    );
    return result;
  },

  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/api/maintenance/schedules/${id}`);
  },

  // Due
  async getDueSchedules(): Promise<MaintenanceSchedule[]> {
    const { data } = await apiClient.get<MaintenanceSchedule[]>('/api/maintenance/due');
    return data;
  },
};
