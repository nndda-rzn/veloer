import { apiClient } from '@/shared/lib/api-client';
import type { UserProfile, ProfileFormData } from '../types/settings';

export const settingsApi = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/api/profile');
    return data;
  },

  async updateProfile(formData: ProfileFormData): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>('/api/profile', formData);
    return data;
  },
};
