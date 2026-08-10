import { injectable } from 'tsyringe';
import type { MaintenanceLogRepository } from '../../../../domain/repositories/maintenance/MaintenanceLogRepository.js';
import type { MaintenanceLog } from '../../../../domain/entities/maintenance/MaintenanceLog.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseMaintenanceLogRepository implements MaintenanceLogRepository {
  async findByBikeId(bikeId: string): Promise<MaintenanceLog[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select('*')
      .eq('bike_id', bikeId)
      .order('service_date', { ascending: false });
    if (error) throw new Error(`Failed to fetch maintenance logs: ${error.message}`);
    return (data || []) as MaintenanceLog[];
  }

  async findById(id: string): Promise<MaintenanceLog | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as MaintenanceLog;
  }

  async create(data: Omit<MaintenanceLog, 'id' | 'created_at'>): Promise<MaintenanceLog> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('maintenance_logs')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`Failed to create maintenance log: ${error.message}`);
    return result as MaintenanceLog;
  }

  async update(id: string, data: Partial<MaintenanceLog>): Promise<MaintenanceLog | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('maintenance_logs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update maintenance log: ${error.message}`);
    return result as MaintenanceLog;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('maintenance_logs').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete maintenance log: ${error.message}`);
  }
}
