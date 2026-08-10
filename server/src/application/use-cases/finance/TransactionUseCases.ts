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
  payment_method?: string | null;
  merchant?: string | null;
}

@injectable()
export class AddTransaction {
  constructor(@inject('TransactionRepository') private txRepo: TransactionRepository) {}

  async execute(userId: string, input: TransactionInput): Promise<Transaction> {
    return this.txRepo.create({
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
      payment_method: input.payment_method ?? null,
      merchant: input.merchant ?? null,
    });
  }
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
