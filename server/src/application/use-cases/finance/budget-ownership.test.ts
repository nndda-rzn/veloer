import { describe, expect, it, vi } from 'vitest';
import 'reflect-metadata';
import { AddTransaction } from './TransactionUseCases.js';
import { AddBudget, UpdateBudget, DeleteBudget } from './BudgetUseCases.js';

const budget = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'b1',
  user_id: 'owner',
  category: 'gear' as const,
  amount: 1000000,
  period: 'monthly' as const,
  start_date: '2026-10-01',
  end_date: null,
  is_active: true,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  ...overrides,
});

function makeBudgetRepo(existing = budget()) {
  return {
    findById: vi.fn().mockResolvedValue(existing),
    update: vi.fn().mockResolvedValue(existing),
    delete: vi.fn().mockResolvedValue(undefined),
    create: vi.fn(),
    findByUserId: vi.fn(),
    findActiveByUserId: vi.fn(),
    getStatus: vi.fn(),
  };
}

describe('UpdateBudget ownership', () => {
  it('refuses to update a budget owned by someone else', async () => {
    const repo = makeBudgetRepo(budget({ user_id: 'someone-else' }));
    const useCase = new UpdateBudget(repo as never);

    const result = await useCase.execute('b1', 'owner', { amount: 5 });

    expect(result).toBeNull();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('updates a budget owned by the caller', async () => {
    const repo = makeBudgetRepo();
    const useCase = new UpdateBudget(repo as never);

    await useCase.execute('b1', 'owner', { amount: 5 });

    expect(repo.update).toHaveBeenCalledWith('b1', { amount: 5 });
  });
});

describe('DeleteBudget ownership', () => {
  it('refuses to delete a budget owned by someone else', async () => {
    const repo = makeBudgetRepo(budget({ user_id: 'someone-else' }));
    const useCase = new DeleteBudget(repo as never);

    const result = await useCase.execute('b1', 'owner');

    expect(result).toBe(false);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});

describe('finance input validation', () => {
  it('rejects a non-positive transaction amount', async () => {
    const repo = { create: vi.fn(), findById: vi.fn(), findByUserId: vi.fn() };
    const useCase = new AddTransaction(repo as never);

    await expect(
      useCase.execute('u', {
        type: 'expense',
        category: 'gear',
        amount: -5,
        date: '2026-10-08',
      }),
    ).rejects.toThrow('amount must be a positive number');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejects a transaction without a date', async () => {
    const repo = { create: vi.fn(), findById: vi.fn(), findByUserId: vi.fn() };
    const useCase = new AddTransaction(repo as never);

    await expect(
      useCase.execute('u', { type: 'expense', category: 'gear', amount: 5, date: '' }),
    ).rejects.toThrow('date is required');
  });

  it('rejects a non-positive budget amount', async () => {
    const repo = makeBudgetRepo();
    const useCase = new AddBudget(repo as never);

    await expect(
      useCase.execute('u', {
        category: 'gear',
        amount: 0,
        period: 'monthly',
        start_date: '2026-10-01',
      }),
    ).rejects.toThrow('amount must be a positive number');
    expect(repo.create).not.toHaveBeenCalled();
  });
});
