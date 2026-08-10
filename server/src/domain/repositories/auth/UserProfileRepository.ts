import type { UserProfile } from '../../entities/auth/User.js';

export interface UserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  create(data: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile>;
  update(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null>;
}
