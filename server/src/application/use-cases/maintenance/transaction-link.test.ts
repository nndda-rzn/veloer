import { describe, expect, it, vi } from 'vitest';
import 'reflect-metadata';
import { LogMaintenance } from './MaintenanceLogUseCases.js';

function makeUseCase() {
  const createdLog = { id: 'log-1', bike_id: 'bike-1' };
  const logRepo = {
    create: vi.fn().mockResolvedValue(createdLog),
  };
  const bikeRepo = {
    findById: vi.fn().mockResolvedValue({ id: 'bike-1', user_id: 'user-1' }),
  };
  const addTransaction = { execute: vi.fn().mockResolvedValue({ id: 'tx-1' }) };
  const useCase = new LogMaintenance(logRepo as never, bikeRepo as never, addTransaction as never);
  return { useCase, addTransaction };
}

const base = {
  bike_id: 'bike-1',
  service_date: '2026-10-04',
  service_km: 1000,
  performed_by: 'self' as const,
};

describe('LogMaintenance transaction link', () => {
  it('stamps the log id on the transaction so deleting the log deletes the cost', async () => {
    const { useCase, addTransaction } = makeUseCase();
    await useCase.execute('user-1', {
      ...base,
      type: 'routine',
      description: 'Chain and cassette',
      cost: 250000,
    });
    expect(addTransaction.execute).toHaveBeenCalledTimes(1);
    expect(addTransaction.execute.mock.calls[0][1].maintenance_log_id).toBe('log-1');
  });

  it('does not create a transaction when there is no cost', async () => {
    const { useCase, addTransaction } = makeUseCase();
    await useCase.execute('user-1', {
      ...base,
      type: 'cleaning',
      description: 'Wiped down',
      cost: 0,
    });
    expect(addTransaction.execute).not.toHaveBeenCalled();
  });

  it('does not create a transaction when cost is null', async () => {
    const { useCase, addTransaction } = makeUseCase();
    await useCase.execute('user-1', {
      ...base,
      type: 'tuning',
      description: 'Derailleur adjust',
      cost: null,
    });
    expect(addTransaction.execute).not.toHaveBeenCalled();
  });
});

describe('AddTransaction schema fallback', () => {
  it('retries without maintenance_log_id when the column is unknown', async () => {
    // Migration 022 is applied manually; until it runs, Postgres rejects the
    // column. Logging a paid service must still work.
    const { AddTransaction } = await import('../finance/TransactionUseCases.js');
    const txRepo = {
      create: vi
        .fn()
        .mockRejectedValueOnce(new Error('column transactions.maintenance_log_id does not exist'))
        .mockResolvedValueOnce({ id: 'tx-1' }),
    };
    const useCase = new AddTransaction(txRepo as never);
    const result = await useCase.execute('user-1', {
      type: 'expense',
      category: 'maintenance',
      amount: 250000,
      date: '2026-10-04',
      maintenance_log_id: 'log-1',
    });
    expect(result).toEqual({ id: 'tx-1' });
    expect(txRepo.create).toHaveBeenCalledTimes(2);
    // The key must be gone, not set to null: naming a column that does not exist
    // yet would fail the insert again.
    expect('maintenance_log_id' in txRepo.create.mock.calls[1][0]).toBe(false);
  });

  it('does not swallow an unrelated error', async () => {
    const { AddTransaction } = await import('../finance/TransactionUseCases.js');
    const txRepo = { create: vi.fn().mockRejectedValue(new Error('connection reset')) };
    const useCase = new AddTransaction(txRepo as never);
    await expect(
      useCase.execute('user-1', {
        type: 'expense',
        category: 'maintenance',
        amount: 1,
        date: '2026-10-04',
      }),
    ).rejects.toThrow('connection reset');
    expect(txRepo.create).toHaveBeenCalledTimes(1);
  });
});
