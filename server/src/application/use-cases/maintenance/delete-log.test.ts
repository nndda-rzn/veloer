import { describe, expect, it, vi } from 'vitest';
import 'reflect-metadata';
import { DeleteMaintenanceLog } from './MaintenanceLogUseCases.js';

function makeUseCase(log: unknown, bike: unknown) {
  const logRepo = {
    findById: vi.fn().mockResolvedValue(log),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const bikeRepo = { findById: vi.fn().mockResolvedValue(bike) };
  return { useCase: new DeleteMaintenanceLog(logRepo as never, bikeRepo as never), logRepo };
}

describe('DeleteMaintenanceLog', () => {
  it('deletes a log that belongs to the user', async () => {
    const { useCase, logRepo } = makeUseCase(
      { id: 'log-1', bike_id: 'bike-1' },
      { id: 'bike-1', user_id: 'user-1' },
    );
    expect(await useCase.execute('log-1', 'user-1')).toBe(true);
    expect(logRepo.delete).toHaveBeenCalledWith('log-1');
  });

  it('refuses a log on another user bike and deletes nothing', async () => {
    const { useCase, logRepo } = makeUseCase(
      { id: 'log-1', bike_id: 'bike-1' },
      { id: 'bike-1', user_id: 'someone-else' },
    );
    expect(await useCase.execute('log-1', 'user-1')).toBe(false);
    expect(logRepo.delete).not.toHaveBeenCalled();
  });

  it('returns false for a log that does not exist', async () => {
    const { useCase, logRepo } = makeUseCase(null, null);
    expect(await useCase.execute('nope', 'user-1')).toBe(false);
    expect(logRepo.delete).not.toHaveBeenCalled();
  });
});
