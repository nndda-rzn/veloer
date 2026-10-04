import { describe, expect, it } from 'vitest';
import { nextDueFrom } from './schedule-due';
import type { MaintenanceSchedule } from '../types/maintenance';

const base: MaintenanceSchedule = {
  id: 's1',
  bike_id: 'b1',
  component_id: null,
  task_name: 'Chain lube',
  interval_km: 500,
  interval_days: 30,
  last_performed_date: null,
  last_performed_km: null,
  next_due_date: null,
  next_due_km: null,
  is_active: true,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
};

describe('nextDueFrom', () => {
  it('advances the due km from the service just performed', () => {
    expect(nextDueFrom(base, 1200, '2026-10-04').next_due_km).toBe(1700);
  });

  it('advances the due date from the service just performed', () => {
    expect(nextDueFrom(base, 1200, '2026-10-04').next_due_date).toBe('2026-11-03');
  });

  it('leaves a trigger null when there is no interval for it', () => {
    const onlyKm = { ...base, interval_days: null };
    expect(nextDueFrom(onlyKm, 1200, '2026-10-04').next_due_date).toBeNull();
    const onlyDays = { ...base, interval_km: null };
    expect(nextDueFrom(onlyDays, 1200, '2026-10-04').next_due_km).toBeNull();
  });

  it('returns both null when neither interval is set', () => {
    const none = { ...base, interval_km: null, interval_days: null };
    expect(nextDueFrom(none, 1200, '2026-10-04')).toEqual({
      next_due_km: null,
      next_due_date: null,
    });
  });
});
