import { injectable } from 'tsyringe';
import type { BudgetRepository } from '../../../../domain/repositories/finance/TransactionRepository.js';
import type { Budget } from '../../../../domain/entities/finance/Transaction.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseBudgetRepository implements BudgetRepository {
  async findByUserId(userId: string): Promise<Budget[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch budgets: ${error.message}`);
    return (data || []) as Budget[];
  }

  async findActiveByUserId(userId: string): Promise<Budget[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch active budgets: ${error.message}`);
    return (data || []) as Budget[];
  }

  async findById(id: string): Promise<Budget | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('budgets').select('*').eq('id', id).single();
    if (error) return null;
    return data as Budget;
  }

  async create(data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase.from('budgets').insert(data).select().single();
    if (error) throw new Error(`Failed to create budget: ${error.message}`);
    return result as Budget;
  }

  async update(id: string, data: Partial<Budget>): Promise<Budget | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('budgets')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update budget: ${error.message}`);
    return result as Budget;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete budget: ${error.message}`);
  }
}
