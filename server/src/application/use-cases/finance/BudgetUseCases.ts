import { inject, injectable } from 'tsyringe';
import type { BudgetRepository } from '../../../domain/repositories/finance/TransactionRepository.js';
import type { Budget, BudgetStatus } from '../../../domain/entities/finance/Transaction.js';
import { assertPositiveAmount, ValidationError } from './ValidationError.js';

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
    assertPositiveAmount(input.amount);
    if (!input.start_date) throw new ValidationError('start_date is required');

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

  async execute(id: string, userId: string, data: Partial<Budget>): Promise<Budget | null> {
    const budget = await this.budgetRepo.findById(id);
    if (!budget || budget.user_id !== userId) return null;
    return this.budgetRepo.update(id, data);
  }
}

@injectable()
export class DeleteBudget {
  constructor(@inject('BudgetRepository') private budgetRepo: BudgetRepository) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const budget = await this.budgetRepo.findById(id);
    if (!budget || budget.user_id !== userId) return false;
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

@injectable()
export class GetBudgetStatus {
  constructor(@inject('BudgetRepository') private budgetRepo: BudgetRepository) {}

  async execute(userId: string, startDate: string, endDate: string): Promise<BudgetStatus[]> {
    return this.budgetRepo.getStatus(userId, startDate, endDate);
  }
}
