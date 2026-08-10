import { injectable } from 'tsyringe';
import type { TransactionRepository } from '../../../../domain/repositories/finance/TransactionRepository.js';
import type { Transaction } from '../../../../domain/entities/finance/Transaction.js';
import { getSupabaseClient } from '../../supabase-client.js';

@injectable()
export class SupabaseTransactionRepository implements TransactionRepository {
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      category?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Transaction[]> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (options?.category) query = query.eq('category', options.category);
    if (options?.type) query = query.eq('type', options.type);
    if (options?.startDate) query = query.gte('date', options.startDate);
    if (options?.endDate) query = query.lte('date', options.endDate);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset)
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);
    return (data || []) as Transaction[];
  }

  async findById(id: string): Promise<Transaction | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (error) return null;
    return data as Transaction;
  }

  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('transactions')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
    return result as Transaction;
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update transaction: ${error.message}`);
    return result as Transaction;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
  }

  async getSummary(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    byCategory: Record<string, number>;
  }> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('transactions')
      .select('type, amount, category')
      .eq('user_id', userId);

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch summary: ${error.message}`);

    const transactions = data || [];
    const byCategory: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      const amount = Number(t.amount);
      if (t.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        byCategory[t.category] = (byCategory[t.category] || 0) + amount;
      }
    }

    return { totalIncome, totalExpense, byCategory };
  }
}
