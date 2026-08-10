import { injectable } from 'tsyringe';
import type { ComponentRepository } from '../../../../domain/repositories/inventory/BikeRepository.js';
import type { Component } from '../../../../domain/entities/inventory/Bike.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseComponentRepository implements ComponentRepository {
  async findByBikeId(bikeId: string): Promise<Component[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('bike_id', bikeId)
      .order('install_date', { ascending: false });
    if (error) throw new Error(`Failed to fetch components: ${error.message}`);
    return (data || []) as Component[];
  }

  async findActiveByBikeId(bikeId: string): Promise<Component[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('bike_id', bikeId)
      .eq('status', 'active')
      .order('install_date', { ascending: false });
    if (error) throw new Error(`Failed to fetch active components: ${error.message}`);
    return (data || []) as Component[];
  }

  async findById(id: string): Promise<Component | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('components').select('*').eq('id', id).single();
    if (error) return null;
    return data as Component;
  }

  async create(
    data: Omit<Component, 'id' | 'created_at' | 'updated_at' | 'current_km'>,
  ): Promise<Component> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('components')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`Failed to create component: ${error.message}`);
    return result as Component;
  }

  async update(id: string, data: Partial<Component>): Promise<Component | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('components')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update component: ${error.message}`);
    return result as Component;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('components').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete component: ${error.message}`);
  }

  async updateCurrentKm(bikeId: string, additionalKm: number): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('add_component_km', {
      bike_id_param: bikeId,
      additional_km: additionalKm,
    });
    if (error) throw new Error(`Failed to update component km: ${error.message}`);
  }
}
