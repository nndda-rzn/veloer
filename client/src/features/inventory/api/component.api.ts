import { apiClient } from '@/shared/lib/api-client';
import type { Component, ComponentFormData } from '../types/inventory';

export const componentApi = {
  async listByBike(bikeId: string): Promise<Component[]> {
    const { data } = await apiClient.get<Component[]>(`/api/bikes/${bikeId}/components`);
    return data;
  },

  async create(formData: ComponentFormData): Promise<Component> {
    const { data } = await apiClient.post<Component>(
      `/api/bikes/${formData.bike_id}/components`,
      formData,
    );
    return data;
  },

  async update(id: string, data: Partial<ComponentFormData>): Promise<Component> {
    const { data: result } = await apiClient.patch<Component>(`/api/components/${id}`, data);
    return result;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/components/${id}`);
  },
};
