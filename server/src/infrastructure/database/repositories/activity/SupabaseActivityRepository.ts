import { injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../../domain/repositories/activity/ActivityRepository.js';
import type { Activity } from '../../../../domain/entities/activity/Activity.js';
import type { Discipline } from '../../../../domain/entities/activity/discipline.js';
import { getSupabaseClient } from '../../supabase-client.js';

// Columns returned by list queries. `polyline` is intentionally excluded: it is
// only needed on the detail screen and would bloat the list payload.
const LIST_COLUMNS = [
  'id',
  'user_id',
  'strava_id',
  'name',
  'type',
  'discipline',
  'start_date',
  'distance',
  'moving_time',
  'elapsed_time',
  'total_elevation_gain',
  'avg_speed',
  'max_speed',
  'avg_hr',
  'max_hr',
  'bike_id',
  'avg_cadence',
  'max_cadence',
  'avg_watts',
  'max_watts',
  'weighted_avg_watts',
  'kilojoules',
  'device_watts',
  'avg_temp',
  'calories',
  'elev_high',
  'elev_low',
  'tss',
  'created_at',
  'updated_at',
].join(', ');

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
      discipline?: Discipline;
    },
  ): Promise<Activity[]> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('activities')
      .select(LIST_COLUMNS)
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (options?.bikeId) query = query.eq('bike_id', options.bikeId);
    if (options?.discipline) query = query.eq('discipline', options.discipline);
    if (options?.startDate) query = query.gte('start_date', options.startDate);
    if (options?.endDate) query = query.lte('start_date', options.endDate);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset)
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch activities: ${error.message}`);
    return (data || []) as unknown as Activity[];
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

  async findExistingStravaIds(stravaIds: number[]): Promise<Set<number>> {
    if (stravaIds.length === 0) return new Set();
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('activities')
      .select('strava_id')
      .in('strava_id', stravaIds);
    if (error) throw new Error(`Failed to fetch existing strava ids: ${error.message}`);
    return new Set((data || []).map((row) => row.strava_id as number));
  }

  async findLatestStravaActivityDate(userId: string): Promise<string | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('activities')
      .select('start_date')
      .eq('user_id', userId)
      .not('strava_id', 'is', null)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Failed to fetch latest strava activity date: ${error.message}`);
    return data?.start_date ?? null;
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

    // Aggregate in the database (migration 019) so we transfer one row instead
    // of every activity in range. If the function has not been applied yet,
    // fall back to summing here rather than breaking the dashboard.
    const { data, error } = await supabase.rpc('activity_stats', {
      p_user_id: userId,
      p_start_date: startDate ?? null,
      p_end_date: endDate ?? null,
    });

    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        return {
          totalDistance: Number(row.total_distance) || 0,
          totalMovingTime: Number(row.total_moving_time) || 0,
          totalElevationGain: Number(row.total_elevation_gain) || 0,
          count: Number(row.activity_count) || 0,
        };
      }
    }

    return this.getStatsFallback(userId, startDate, endDate);
  }

  /** Pre-migration path: aggregate in Node. Kept so deploys stay safe. */
  private async getStatsFallback(
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
      .eq('user_id', userId)
      // Cycling only: a strength session has no distance and must not count
      // toward ride volume.
      .eq('discipline', 'cycling');

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
