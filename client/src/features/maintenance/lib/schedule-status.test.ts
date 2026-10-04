import { describe, expect, it } from 'vitest';
import { scheduleProgress } from './schedule-status';
import type { MaintenanceSchedule } from '../types/maintenance';

function schedule(overrides: Partial<MaintenanceSchedule> = {}): MaintenanceSchedule {
  return {
    id: 's1',
    bike_id: 'b1',
    component_id: null,
    task_name: 'Chain lube',
    interval_km: 500,
    interval_days: null,
    last_performed_date: '2026-09-01',
    last_performed_km: 1000,
    next_due_date: null,
    next_due_km: 1500,
    is_active: true,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

const today = new Date('2026-10-04T00:00:00Z');

describe('scheduleProgress', () => {
  it('reports unscheduled when there is no interval and no due value', () => {
    const p = scheduleProgress(
      schedule({ interval_km: null, next_due_km: null, last_performed_km: null }),
      1200,
      today,
    );
    expect(p.band).toBe('unscheduled');
    expect(p.progress).toBeNull();
  });

  it('computes progress along the rail from last performed to due', () => {
    // 1000 -> 1500, now at 1250 = halfway
    const p = scheduleProgress(schedule(), 1250, today);
    expect(p.band).toBe('ok');
    expect(p.progress).toBeCloseTo(0.5, 5);
    expect(p.remainingKm).toBe(250);
  });

  it('marks a reminder due when the odometer reaches the due km', () => {
    expect(scheduleProgress(schedule(), 1500, today).band).toBe('due');
  });

  it('marks a reminder overdue when the odometer passes the due km', () => {
    const p = scheduleProgress(schedule(), 1600, today);
    expect(p.band).toBe('overdue');
    expect(p.remainingKm).toBe(-100);
  });

  it('marks a reminder soon when within 15 percent of the interval', () => {
    // 1000 -> 1500, 15% = 75 km, so 1430 is soon
    expect(scheduleProgress(schedule(), 1430, today).band).toBe('soon');
  });

  it('never reports negative progress or more than one when the odometer goes backwards', () => {
    const p = scheduleProgress(schedule(), 900, today);
    expect(p.progress).toBe(0);
    expect(p.band).toBe('ok');
  });

  it('works from a due date when there is no km trigger', () => {
    const s = schedule({
      interval_km: null,
      next_due_km: null,
      interval_days: 30,
      last_performed_km: null,
      last_performed_date: '2026-09-01',
      next_due_date: '2026-10-01',
    });
    // 2026-10-04 is past the 2026-10-01 due date.
    expect(scheduleProgress(s, 0, today).band).toBe('overdue');
    // 2026-09-29 is 2 days before due, inside the 3-day "soon" window.
    expect(scheduleProgress(s, 0, new Date('2026-09-29T00:00:00Z')).band).toBe('soon');
    // 2026-09-20 is 11 days before due: still comfortably ok.
    expect(scheduleProgress(s, 0, new Date('2026-09-20T00:00:00Z')).band).toBe('ok');
  });
});
