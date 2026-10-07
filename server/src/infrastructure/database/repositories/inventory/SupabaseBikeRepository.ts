import { injectable } from 'tsyringe';
import type { BikeRepository } from '../../../../domain/repositories/inventory/BikeRepository.js';
import type { Bike } from '../../../../domain/entities/inventory/Bike.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseBikeRepository implements BikeRepository {
  async findByUserId(userId: string): Promise<Bike[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('bikes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch bikes: ${error.message}`);
    return (data || []) as Bike[];
  }

  async findById(id: string): Promise<Bike | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('bikes').select('*').eq('id', id).single();
    if (error) return null;
    return data as Bike;
  }

  async create(data: Omit<Bike, 'id' | 'created_at' | 'updated_at' | 'current_km'>): Promise<Bike> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase.from('bikes').insert(data).select().single();
    if (error) throw new Error(`Failed to create bike: ${error.message}`);
    return result as Bike;
  }

  async update(id: string, data: Partial<Bike>): Promise<Bike | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('bikes')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update bike: ${error.message}`);
    return result as Bike;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('bikes').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete bike: ${error.message}`);
  }

  async updateCurrentKm(id: string, additionalKm: number): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('add_bike_km', {
      bike_id: id,
      additional_km: additionalKm,
    });
    if (error) throw new Error(`Failed to update bike km: ${error.message}`);
  }

  async findMaintenanceAlertCounts(bikeIds: string[]): Promise<Record<string, number>> {
    if (bikeIds.length === 0) return {};
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('components')
      .select('bike_id, install_km, current_km, expected_lifespan_km, status')
      .in('bike_id', bikeIds);

    if (error) throw new Error(`Failed to fetch component alerts: ${error.message}`);

    const counts: Record<string, number> = {};
    for (const c of data || []) {
      // Alert if: failed status, or wear (km since install) >= 90% of lifespan
      const isFailed = c.status === 'failed';
      const wearKm = Number(c.current_km) - Number(c.install_km ?? 0);
      const isLifespanCritical =
        c.expected_lifespan_km && c.expected_lifespan_km > 0
          ? wearKm / c.expected_lifespan_km >= 0.9
          : false;

      if (isFailed || isLifespanCritical) {
        counts[c.bike_id] = (counts[c.bike_id] ?? 0) + 1;
      }
    }
    return counts;
  }
}
