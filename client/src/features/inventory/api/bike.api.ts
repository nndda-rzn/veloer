import { apiClient } from '@/shared/lib/api-client';
import type { Bike, BikeFormData } from '../types/inventory';

export const bikeApi = {
  async list(): Promise<Bike[]> {
    const { data } = await apiClient.get<Bike[]>('/api/bikes');
    return data;
  },

  async getById(id: string): Promise<Bike> {
    const { data } = await apiClient.get<Bike>(`/api/bikes/${id}`);
    return data;
  },

  async create(formData: BikeFormData): Promise<Bike> {
    const { data } = await apiClient.post<Bike>('/api/bikes', formData);
    return data;
  },

  async update(id: string, formData: Partial<BikeFormData>): Promise<Bike> {
    const { data } = await apiClient.patch<Bike>(`/api/bikes/${id}`, formData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/bikes/${id}`);
  },

  async uploadPhoto(id: string, file: File): Promise<{ photo_url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    const { data } = await apiClient.post<{ photo_url: string }>(
      `/api/bikes/${id}/photo`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return data;
  },
};
