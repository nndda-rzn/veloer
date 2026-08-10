import type { Goal } from '../../entities/goals/Goal.js';

export interface GoalRepository {
  findByUserId(userId: string): Promise<Goal[]>;
  findActiveByUserId(userId: string): Promise<Goal[]>;
  findById(id: string): Promise<Goal | null>;
  create(data: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'current_value'>): Promise<Goal>;
  update(id: string, data: Partial<Goal>): Promise<Goal | null>;
  updateProgress(id: string, additionalValue: number): Promise<void>;
  delete(id: string): Promise<void>;
}
