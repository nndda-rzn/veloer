import { injectable } from 'tsyringe';
import type { UserRepository } from '../../../../domain/repositories/auth/UserRepository.js';
import type { User, StravaToken } from '../../../../domain/entities/auth/User.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return null;
    return data as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) return null;
    return data as User;
  }

  async findByStravaId(stravaId: number): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('strava_id', stravaId)
      .single();
    if (error) return null;
    return data as User;
  }

  async create(data: { email: string; strava_id?: number }): Promise<User> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase.from('users').insert(data).select().single();
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return result as User;
  }

  async updateStravaTokens(
    id: string,
    tokens: {
      strava_access_token: string;
      strava_refresh_token: string;
      strava_token_expires_at: string;
    },
  ): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('users').update(tokens).eq('id', id);
    if (error) throw new Error(`Failed to update Strava tokens: ${error.message}`);
  }

  async getStravaTokens(id: string): Promise<StravaToken | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('strava_access_token, strava_refresh_token, strava_token_expires_at')
      .eq('id', id)
      .single();
    if (error || !data) return null;

    const user = data as Pick<
      User,
      'strava_access_token' | 'strava_refresh_token' | 'strava_token_expires_at'
    >;
    if (!user.strava_access_token || !user.strava_refresh_token) return null;

    return {
      access_token: user.strava_access_token,
      refresh_token: user.strava_refresh_token,
      expires_at: new Date(user.strava_token_expires_at!).getTime() / 1000,
      token_type: 'Bearer',
    };
  }
}
