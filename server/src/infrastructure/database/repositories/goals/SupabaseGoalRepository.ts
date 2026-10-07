import { injectable } from 'tsyringe';
import type { GoalRepository } from '../../../../domain/repositories/goals/GoalRepository.js';
import type { Goal } from '../../../../domain/entities/goals/Goal.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseGoalRepository implements GoalRepository {
  async findByUserId(userId: string): Promise<Goal[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch goals: ${error.message}`);
    return (data || []) as Goal[];
  }

  async findActiveByUserId(userId: string): Promise<Goal[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch active goals: ${error.message}`);
    return (data || []) as Goal[];
  }

  async findById(id: string): Promise<Goal | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('goals').select('*').eq('id', id).single();
    if (error) return null;
    return data as Goal;
  }

  async create(
    data: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'current_value'>,
  ): Promise<Goal> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase.from('goals').insert(data).select().single();
    if (error) throw new Error(`Failed to create goal: ${error.message}`);
    return result as Goal;
  }

  async update(id: string, data: Partial<Goal>): Promise<Goal | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('goals')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update goal: ${error.message}`);
    return result as Goal;
  }

  async recomputeProgress(id: string): Promise<Goal | null> {
    const supabase = getSupabaseClient();
    const { data: goal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) return null;

    const g = goal as Goal;
    const derived = await this.activityValueInRange(g.user_id, g.type, g.start_date, g.end_date);
    const manual = Number(g.manual_adjustment || 0);
    const newValue = derived + manual;

    const updateData: Partial<Goal> = { current_value: newValue };
    // Auto-complete only an active goal whose target is reached. Never
    // override a status the user set manually (completed/failed/cancelled).
    if (g.status === 'active' && newValue >= g.target_value) {
      updateData.status = 'completed';
    }

    const { data: result, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to recompute goal progress: ${error.message}`);
    return result as Goal;
  }

  async adjustProgress(id: string, delta: number): Promise<Goal | null> {
    const supabase = getSupabaseClient();
    const { data: goal, error } = await supabase
      .from('goals')
      .select('manual_adjustment')
      .eq('id', id)
      .single();
    if (error) return null;

    const nextManual =
      Number((goal as { manual_adjustment: number }).manual_adjustment || 0) + delta;
    const { error: updateError } = await supabase
      .from('goals')
      .update({ manual_adjustment: nextManual })
      .eq('id', id);
    if (updateError) throw new Error(`Failed to adjust goal: ${updateError.message}`);

    return this.recomputeProgress(id);
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete goal: ${error.message}`);
  }

  /** Sum activity metrics within a date range for the given goal type. */
  private async activityValueInRange(
    userId: string,
    type: Goal['type'],
    startDate: string,
    endDate: string,
  ): Promise<number> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('activities')
      .select('distance, moving_time, total_elevation_gain')
      .eq('user_id', userId)
      // Cycling only: goals measure riding, so a gym session must never fill a
      // distance, time, elevation or count goal.
      .eq('discipline', 'cycling')
      .gte('start_date', `${startDate}T00:00:00`)
      .lte('start_date', `${endDate}T23:59:59`);
    if (error) throw new Error(`Failed to fetch activities for goal: ${error.message}`);

    const rows = data || [];
    switch (type) {
      case 'distance':
        return rows.reduce((s, a) => s + Number(a.distance) / 1000, 0); // km
      case 'time':
        return rows.reduce((s, a) => s + Number(a.moving_time) / 3600, 0); // hours
      case 'elevation':
        return rows.reduce((s, a) => s + Number(a.total_elevation_gain || 0), 0); // m
      case 'activities_count':
        return rows.length;
    }
  }
}
