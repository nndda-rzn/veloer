import { apiClient } from '@/shared/lib/api-client';
import type { Event, EventFormData } from '../types/event';

export const eventApi = {
  async list(upcoming?: boolean): Promise<Event[]> {
    const { data } = await apiClient.get<Event[]>('/api/events', {
      params: upcoming !== undefined ? { upcoming } : undefined,
    });
    return data;
  },

  async create(formData: EventFormData): Promise<Event> {
    const { data } = await apiClient.post<Event>('/api/events', formData);
    return data;
  },

  async update(id: string, formData: Partial<EventFormData>): Promise<Event> {
    const { data } = await apiClient.patch<Event>(`/api/events/${id}`, formData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/events/${id}`);
  },
};
