import { injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../../domain/repositories/activity/ActivityRepository.js';
import type { Activity } from '../../../../domain/entities/activity/Activity.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseActivityRepository implements ActivityRepository {
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      bikeId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Activity[]> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (options?.bikeId) query = query.eq('bike_id', options.bikeId);
    if (options?.startDate) query = query.gte('start_date', options.startDate);
    if (options?.endDate) query = query.lte('start_date', options.endDate);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset)
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch activities: ${error.message}`);
    return (data || []) as Activity[];
  }

  async findById(id: string): Promise<Activity | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('activities').select('*').eq('id', id).single();
    if (error) return null;
    return data as Activity;
  }

  async findByStravaId(stravaId: number): Promise<Activity | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('strava_id', stravaId)
      .single();
    if (error) return null;
    return data as Activity;
  }

  async create(data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('activities')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`Failed to create activity: ${error.message}`);
    return result as Activity;
  }

  async createMany(
    data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>[],
  ): Promise<Activity[]> {
    if (data.length === 0) return [];
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase.from('activities').insert(data).select();
    if (error) throw new Error(`Failed to create activities: ${error.message}`);
    return (result || []) as Activity[];
  }

  async updateBikeId(activityId: string, bikeId: string | null): Promise<void> {
    const supabase = getSupabaseClient();

    if (bikeId) {
      // Link activity to bike via RPC: also updates bike & component km
      const { error } = await supabase.rpc('link_activity_bike', {
        activity_uuid: activityId,
        bike_uuid: bikeId,
      });
      if (error) throw new Error(`Failed to link activity to bike: ${error.message}`);
    } else {
      // Unlink bike from activity (just clear bike_id, no km adjustment)
      const { error } = await supabase
        .from('activities')
        .update({ bike_id: null })
        .eq('id', activityId);
      if (error) throw new Error(`Failed to unlink activity bike: ${error.message}`);
    }
  }

  async getStats(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalDistance: number;
    totalMovingTime: number;
    totalElevationGain: number;
    count: number;
  }> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('activities')
      .select('distance, moving_time, total_elevation_gain')
      .eq('user_id', userId);

    if (startDate) query = query.gte('start_date', startDate);
    if (endDate) query = query.lte('start_date', endDate);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch activity stats: ${error.message}`);

    const activities = data || [];
    return {
      totalDistance: activities.reduce((sum, a) => sum + Number(a.distance), 0),
      totalMovingTime: activities.reduce((sum, a) => sum + Number(a.moving_time), 0),
      totalElevationGain: activities.reduce(
        (sum, a) => sum + Number(a.total_elevation_gain || 0),
        0,
      ),
      count: activities.length,
    };
  }
}
