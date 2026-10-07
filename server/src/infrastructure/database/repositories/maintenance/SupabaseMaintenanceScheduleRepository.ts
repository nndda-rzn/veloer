import { injectable } from 'tsyringe';
import type { MaintenanceScheduleRepository } from '../../../../domain/repositories/maintenance/MaintenanceLogRepository.js';
import type { MaintenanceSchedule } from '../../../../domain/entities/maintenance/MaintenanceLog.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseMaintenanceScheduleRepository implements MaintenanceScheduleRepository {
  async findByBikeId(bikeId: string): Promise<MaintenanceSchedule[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('bike_id', bikeId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch schedules: ${error.message}`);
    return (data || []) as MaintenanceSchedule[];
  }

  async findDueSchedules(
    userId: string,
    options?: { currentKm?: number; date?: string },
  ): Promise<MaintenanceSchedule[]> {
    const supabase = getSupabaseClient();

    // The server uses the service-role key, which bypasses RLS, so ownership
    // must be enforced here: only ever look at schedules on this user's bikes.
    const { data: bikes, error: bikeError } = await supabase
      .from('bikes')
      .select('id, current_km')
      .eq('user_id', userId);
    if (bikeError) throw new Error(`Failed to fetch bikes: ${bikeError.message}`);

    const bikeIds = (bikes || []).map((b) => b.id as string);
    if (bikeIds.length === 0) return [];

    const currentKmByBike = new Map<string, number>(
      (bikes || []).map((b) => [b.id as string, Number(b.current_km) || 0]),
    );

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('is_active', true)
      .in('bike_id', bikeIds);
    if (error) throw new Error(`Failed to fetch due schedules: ${error.message}`);

    const today = options?.date ?? new Date().toISOString().slice(0, 10);

    // A schedule is due only when it actually has a trigger that has passed.
    // A schedule with neither a due date nor a due distance is a template, not
    // a warning, so it is excluded rather than surfaced as "due".
    return ((data || []) as MaintenanceSchedule[]).filter((schedule) => {
      const dueByDate =
        schedule.next_due_date != null && schedule.next_due_date.slice(0, 10) <= today;

      const bikeKm = options?.currentKm ?? currentKmByBike.get(schedule.bike_id) ?? 0;
      const dueByKm = schedule.next_due_km != null && bikeKm >= Number(schedule.next_due_km);

      return dueByDate || dueByKm;
    });
  }

  async findById(id: string): Promise<MaintenanceSchedule | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as MaintenanceSchedule;
  }

  async create(
    data: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<MaintenanceSchedule> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('maintenance_schedules')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`Failed to create schedule: ${error.message}`);
    return result as MaintenanceSchedule;
  }

  async update(
    id: string,
    data: Partial<MaintenanceSchedule>,
  ): Promise<MaintenanceSchedule | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('maintenance_schedules')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update schedule: ${error.message}`);
    return result as MaintenanceSchedule;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('maintenance_schedules').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete schedule: ${error.message}`);
  }
}
