import { injectable } from 'tsyringe';
import type { BudgetRepository } from '../../../../domain/repositories/finance/TransactionRepository.js';
import type { Budget, BudgetStatus } from '../../../../domain/entities/finance/Transaction.js';
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

  /**
   * One row per active budget that is inside its own date window today.
   *
   * Sums expenses from the transactions table rather than trusting a stored
   * counter, because transactions arrive from several places (manual entry,
   * maintenance logs, event fees) and none of them would keep a counter honest.
   */
  async getStatus(userId: string, startDate: string, endDate: string): Promise<BudgetStatus[]> {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().slice(0, 10);

    const budgets = (await this.findActiveByUserId(userId)).filter((b) => budgetInWindow(b, today));

    const statuses: BudgetStatus[] = [];
    for (const budget of budgets) {
      let query = supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      // A "total" budget caps every expense; a category budget caps just its own.
      if (budget.category !== 'total') query = query.eq('category', budget.category);

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch budget status: ${error.message}`);

      const spent = (data || []).reduce((sum, row) => sum + Number(row.amount), 0);
      const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 1000) / 10 : 0;

      statuses.push({
        category: budget.category,
        budgetAmount: Number(budget.amount),
        spent,
        percentage,
      });
    }

    return statuses;
  }
}

/** Mirrors the dashboard's rule: active from `start_date` until `end_date` (or forever). */
function budgetInWindow(budget: Budget, today: string): boolean {
  if (budget.start_date > today) return false;
  if (budget.end_date == null) return true;
  return budget.end_date >= today;
}
