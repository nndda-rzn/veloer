import { injectable } from 'tsyringe';
import type { UserProfileRepository } from '../../../../domain/repositories/auth/UserProfileRepository.js';
import type { UserProfile } from '../../../../domain/entities/auth/User.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseUserProfileRepository implements UserProfileRepository {
  async findByUserId(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as UserProfile;
  }

  async create(data: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('user_profiles')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`Failed to create user profile: ${error.message}`);
    return result as UserProfile;
  }

  async update(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) return null;
    return result as UserProfile;
  }
}
