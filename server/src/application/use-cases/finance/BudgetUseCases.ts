import { inject, injectable } from 'tsyringe';
import type { BudgetRepository } from '../../../domain/repositories/finance/TransactionRepository.js';
import type { Budget } from '../../../domain/entities/finance/Transaction.js';

export interface BudgetInput {
  category: Budget['category'];
  amount: number;
  period: Budget['period'];
  start_date: string;
  end_date?: string | null;
  is_active?: boolean;
}

@injectable()
export class AddBudget {
  constructor(@inject('BudgetRepository') private budgetRepo: BudgetRepository) {}

  async execute(userId: string, input: BudgetInput): Promise<Budget> {
    return this.budgetRepo.create({
      user_id: userId,
      category: input.category,
      amount: input.amount,
      period: input.period,
      start_date: input.start_date,
      end_date: input.end_date ?? null,
      is_active: input.is_active ?? true,
    });
  }
}

@injectable()
export class UpdateBudget {
  constructor(@inject('BudgetRepository') private budgetRepo: BudgetRepository) {}

  async execute(id: string, data: Partial<Budget>): Promise<Budget | null> {
    return this.budgetRepo.update(id, data);
  }
}

@injectable()
export class DeleteBudget {
  constructor(@inject('BudgetRepository') private budgetRepo: BudgetRepository) {}

  async execute(id: string): Promise<boolean> {
    const budget = await this.budgetRepo.findById(id);
    if (!budget) return false;
    await this.budgetRepo.delete(id);
    return true;
  }
}

@injectable()
export class GetBudgets {
  constructor(@inject('BudgetRepository') private budgetRepo: BudgetRepository) {}

  async execute(userId: string): Promise<Budget[]> {
    return this.budgetRepo.findByUserId(userId);
  }

  async executeActive(userId: string): Promise<Budget[]> {
    return this.budgetRepo.findActiveByUserId(userId);
  }
}
