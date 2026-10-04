import { inject, injectable } from 'tsyringe';
import type { TransactionRepository } from '../../../domain/repositories/finance/TransactionRepository.js';
import type { Transaction } from '../../../domain/entities/finance/Transaction.js';

export interface TransactionInput {
  type: Transaction['type'];
  category: Transaction['category'];
  amount: number;
  date: string;
  description?: string | null;
  bike_id?: string | null;
  component_id?: string | null;
  event_id?: string | null;
  activity_id?: string | null;
  maintenance_log_id?: string | null;
  payment_method?: string | null;
  merchant?: string | null;
}

@injectable()
export class AddTransaction {
  constructor(@inject('TransactionRepository') private txRepo: TransactionRepository) {}

  async execute(userId: string, input: TransactionInput): Promise<Transaction> {
    const payload: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      type: input.type,
      category: input.category,
      amount: input.amount,
      date: input.date,
      description: input.description ?? null,
      bike_id: input.bike_id ?? null,
      component_id: input.component_id ?? null,
      event_id: input.event_id ?? null,
      activity_id: input.activity_id ?? null,
      maintenance_log_id: input.maintenance_log_id ?? null,
      payment_method: input.payment_method ?? null,
      merchant: input.merchant ?? null,
    };

    try {
      return await this.txRepo.create(payload);
    } catch (err) {
      // Migration 022 adds maintenance_log_id and is applied manually. Until it
      // runs, a write naming the column fails; retry with the key removed so
      // logging a service still works. The cost then is simply not linked (the
      // same state as rows that predate the column), rather than failing outright.
      if (!isUnknownColumnError(err, 'maintenance_log_id')) throw err;
      const withoutLink: Record<string, unknown> = { ...payload };
      delete withoutLink.maintenance_log_id;
      return this.txRepo.create(withoutLink as unknown as typeof payload);
    }
  }
}

/** True when an error is Postgres reporting an unknown column. */
function isUnknownColumnError(err: unknown, column: string): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes(column) &&
    (message.includes('does not exist') || message.includes('schema cache'))
  );
}

@injectable()
export class UpdateTransaction {
  constructor(@inject('TransactionRepository') private txRepo: TransactionRepository) {}

  async execute(
    id: string,
    userId: string,
    data: Partial<Transaction>,
  ): Promise<Transaction | null> {
    const tx = await this.txRepo.findById(id);
    if (!tx || tx.user_id !== userId) return null;
    return this.txRepo.update(id, data);
  }
}

@injectable()
export class DeleteTransaction {
  constructor(@inject('TransactionRepository') private txRepo: TransactionRepository) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const tx = await this.txRepo.findById(id);
    if (!tx || tx.user_id !== userId) return false;
    await this.txRepo.delete(id);
    return true;
  }
}

@injectable()
export class GetTransactions {
  constructor(@inject('TransactionRepository') private txRepo: TransactionRepository) {}

  async execute(
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
    return this.txRepo.findByUserId(userId, options);
  }
}

@injectable()
export class GetFinanceSummary {
  constructor(@inject('TransactionRepository') private txRepo: TransactionRepository) {}

  async execute(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    byCategory: Record<string, number>;
  }> {
    return this.txRepo.getSummary(userId, startDate, endDate);
  }
}
