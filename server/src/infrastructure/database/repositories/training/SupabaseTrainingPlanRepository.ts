import { injectable } from 'tsyringe';
import type { TrainingPlanRepository } from '../../../../domain/repositories/training/TrainingPlanRepository.js';
import type {
  TrainingPlan,
  TrainingPlanCreateData,
} from '../../../../domain/entities/training/TrainingPlan.js';
import type {
  TrainingWorkout,
  TrainingWorkoutCreateData,
} from '../../../../domain/entities/training/TrainingWorkout.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseTrainingPlanRepository implements TrainingPlanRepository {
  // ---- Plans ----

  async findByUser(userId: string): Promise<TrainingPlan[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch training plans: ${error.message}`);
    return (data || []) as TrainingPlan[];
  }

  async findById(id: string, userId: string): Promise<TrainingPlan | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as TrainingPlan;
  }

  async create(data: TrainingPlanCreateData): Promise<TrainingPlan> {
    const supabase = getSupabaseClient();
    const insertData = {
      ...data,
      status: data.status ?? 'active',
    };
    const { data: result, error } = await supabase
      .from('training_plans')
      .insert(insertData)
      .select()
      .single();
    if (error) throw new Error(`Failed to create training plan: ${error.message}`);
    return result as TrainingPlan;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<TrainingPlan>,
  ): Promise<TrainingPlan | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('training_plans')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update training plan: ${error.message}`);
    return result as TrainingPlan;
  }

  async delete(id: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(`Failed to delete training plan: ${error.message}`);
  }

  // ---- Workouts ----

  async findWorkouts(planId: string, userId: string): Promise<TrainingWorkout[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('training_plan_workouts')
      .select('*')
      .eq('plan_id', planId)
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true });
    if (error) throw new Error(`Failed to fetch workouts: ${error.message}`);
    return (data || []) as TrainingWorkout[];
  }

  async findWorkoutById(id: string, userId: string): Promise<TrainingWorkout | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('training_plan_workouts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as TrainingWorkout;
  }

  async findWorkoutsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TrainingWorkout[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('training_plan_workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true });
    if (error) throw new Error(`Failed to fetch workouts by date range: ${error.message}`);
    return (data || []) as TrainingWorkout[];
  }

  async createWorkout(data: TrainingWorkoutCreateData): Promise<TrainingWorkout> {
    const supabase = getSupabaseClient();
    const insertData = {
      ...data,
      status: data.status ?? 'planned',
    };
    const { data: result, error } = await supabase
      .from('training_plan_workouts')
      .insert(insertData)
      .select()
      .single();
    if (error) throw new Error(`Failed to create workout: ${error.message}`);
    return result as TrainingWorkout;
  }

  async updateWorkout(
    id: string,
    userId: string,
    data: Partial<TrainingWorkout>,
  ): Promise<TrainingWorkout | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('training_plan_workouts')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update workout: ${error.message}`);
    return result as TrainingWorkout;
  }

  async deleteWorkout(id: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('training_plan_workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(`Failed to delete workout: ${error.message}`);
  }
}
