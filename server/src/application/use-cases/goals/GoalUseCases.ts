import { inject, injectable } from 'tsyringe';
import type { GoalRepository } from '../../../domain/repositories/goals/GoalRepository.js';
import type { Goal } from '../../../domain/entities/goals/Goal.js';

export interface CreateGoalInput {
  type: Goal['type'];
  target_value: number;
  unit: string;
  period: Goal['period'];
  start_date: string;
  end_date: string;
  title?: string | null;
  description?: string | null;
}

@injectable()
export class CreateGoal {
  constructor(@inject('GoalRepository') private goalRepo: GoalRepository) {}

  async execute(userId: string, input: CreateGoalInput): Promise<Goal> {
    return this.goalRepo.create({
      user_id: userId,
      type: input.type,
      target_value: input.target_value,
      unit: input.unit,
      period: input.period,
      start_date: input.start_date,
      end_date: input.end_date,
      title: input.title ?? null,
      description: input.description ?? null,
      status: 'active',
    });
  }
}

@injectable()
export class UpdateGoal {
  constructor(@inject('GoalRepository') private goalRepo: GoalRepository) {}

  async execute(id: string, data: Partial<Goal>): Promise<Goal | null> {
    return this.goalRepo.update(id, data);
  }
}

@injectable()
export class DeleteGoal {
  constructor(@inject('GoalRepository') private goalRepo: GoalRepository) {}

  async execute(id: string): Promise<boolean> {
    const goal = await this.goalRepo.findById(id);
    if (!goal) return false;
    await this.goalRepo.delete(id);
    return true;
  }
}

@injectable()
export class GetGoals {
  constructor(@inject('GoalRepository') private goalRepo: GoalRepository) {}

  async execute(userId: string): Promise<Goal[]> {
    return this.goalRepo.findByUserId(userId);
  }

  async executeActive(userId: string): Promise<Goal[]> {
    return this.goalRepo.findActiveByUserId(userId);
  }
}

@injectable()
export class GetGoalStatus {
  constructor(@inject('GoalRepository') private goalRepo: GoalRepository) {}

  async execute(id: string): Promise<Goal | null> {
    return this.goalRepo.findById(id);
  }
}

@injectable()
export class UpdateGoalProgress {
  constructor(@inject('GoalRepository') private goalRepo: GoalRepository) {}

  async execute(id: string, additionalValue: number): Promise<void> {
    await this.goalRepo.updateProgress(id, additionalValue);
  }
}
