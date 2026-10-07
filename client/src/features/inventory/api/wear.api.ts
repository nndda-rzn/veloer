import { apiClient } from '@/shared/lib/api-client';
import type { WearAlert } from '../types/inventory';

export const wearApi = {
  async list(): Promise<WearAlert[]> {
    const { data } = await apiClient.get<WearAlert[]>('/api/components/wear-alerts');
    return data;
  },
};
