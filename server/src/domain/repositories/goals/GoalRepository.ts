import type { Goal } from '../../entities/goals/Goal.js';

/** Activity totals within a goal's date range, used to derive progress. */
export interface GoalActivityTotals {
  distanceKm: number;
  hours: number;
  elevationM: number;
  count: number;
}

export interface GoalRepository {
  findByUserId(userId: string): Promise<Goal[]>;
  findActiveByUserId(userId: string): Promise<Goal[]>;
  findById(id: string): Promise<Goal | null>;
  create(data: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'current_value'>): Promise<Goal>;
  update(id: string, data: Partial<Goal>): Promise<Goal | null>;
  /**
   * Set current_value to (activity-derived value for the goal's range) +
   * manual_adjustment, and flip status to completed when the target is met.
   */
  recomputeProgress(id: string): Promise<Goal | null>;
  /** Add a delta to manual_adjustment, then recompute current_value. */
  adjustProgress(id: string, delta: number): Promise<Goal | null>;
  delete(id: string): Promise<void>;
}
