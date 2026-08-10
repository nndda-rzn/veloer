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
}
