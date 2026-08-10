import { injectable } from 'tsyringe';
import type { EventRepository } from '../../../../domain/repositories/events/EventRepository.js';
import type { Event } from '../../../../domain/entities/events/Event.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseEventRepository implements EventRepository {
  async findByUserId(userId: string): Promise<Event[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw new Error(`Failed to fetch events: ${error.message}`);
    return (data || []) as Event[];
  }

  async findUpcoming(userId: string, daysAhead: number = 30): Promise<Event[]> {
    const supabase = getSupabaseClient();
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + daysAhead);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('date', now.toISOString())
      .lte('date', future.toISOString())
      .order('date', { ascending: true });
    if (error) throw new Error(`Failed to fetch upcoming events: ${error.message}`);
    return (data || []) as Event[];
  }

  async findById(id: string): Promise<Event | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error) return null;
    return data as Event;
  }

  async create(data: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase.from('events').insert(data).select().single();
    if (error) throw new Error(`Failed to create event: ${error.message}`);
    return result as Event;
  }

  async update(id: string, data: Partial<Event>): Promise<Event | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('events')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return result as Event;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete event: ${error.message}`);
  }
}
