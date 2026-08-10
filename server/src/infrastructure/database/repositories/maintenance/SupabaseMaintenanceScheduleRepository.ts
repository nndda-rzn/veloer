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
    _userId: string,
    _options?: { currentKm?: number; date?: string },
  ): Promise<MaintenanceSchedule[]> {
    // TODO: Implement due schedule logic with joins to bikes for current_km
    // For now, return active schedules with next_due_date <= now or next_due_km <= current_km
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('is_active', true)
      .or(`next_due_date.lte.${now},next_due_date.is.null`);
    if (error) throw new Error(`Failed to fetch due schedules: ${error.message}`);
    return (data || []) as MaintenanceSchedule[];
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
