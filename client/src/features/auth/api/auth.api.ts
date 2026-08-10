import { apiClient } from '@/shared/lib/api-client';

export interface AuthUser {
  userId: string;
  email: string;
  stravaId: number | null;
}

export const authApi = {
  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>('/api/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },

  getLoginUrl(): string {
    return `${import.meta.env.VITE_API_URL}/api/auth/login`;
  },
};
