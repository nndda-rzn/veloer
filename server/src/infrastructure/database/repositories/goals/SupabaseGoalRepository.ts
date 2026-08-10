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

  async updateProgress(id: string, additionalValue: number): Promise<void> {
    const supabase = getSupabaseClient();
    const { data: goal, error: fetchError } = await supabase
      .from('goals')
      .select('current_value, target_value, status')
      .eq('id', id)
      .single();
    if (fetchError) throw new Error(`Failed to fetch goal for progress: ${fetchError.message}`);

    const newValue = (goal.current_value || 0) + additionalValue;
    const updateData: Partial<Goal> = { current_value: newValue };

    if (newValue >= goal.target_value) {
      updateData.status = 'completed';
    }

    const { error } = await supabase.from('goals').update(updateData).eq('id', id);
    if (error) throw new Error(`Failed to update goal progress: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete goal: ${error.message}`);
  }
}
