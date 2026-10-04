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

  async uploadAvatar(file: File): Promise<{ avatar_url: string; profile: UserProfile }> {
    const formData = new FormData();
    formData.append('photo', file);
    const { data } = await apiClient.post<{ avatar_url: string; profile: UserProfile }>(
      '/api/profile/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
