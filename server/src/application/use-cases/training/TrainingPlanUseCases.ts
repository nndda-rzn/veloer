import { inject, injectable } from 'tsyringe';
import type { TrainingPlanRepository } from '../../../domain/repositories/training/TrainingPlanRepository.js';
import type {
  TrainingPlan,
  TrainingPlanCreateData,
  TrainingPlanSummary,
} from '../../../domain/entities/training/TrainingPlan.js';

export interface TrainingPlanCreateInput {
  title: string;
  description?: string | null;
  goal_type: TrainingPlan['goal_type'];
  start_date: string;
  end_date: string;
  ftp_baseline?: number;
}

@injectable()
export class GetTrainingPlans {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(userId: string): Promise<TrainingPlanSummary[]> {
    const [plans, counts] = await Promise.all([
      this.planRepo.findByUser(userId),
      this.planRepo.getWorkoutCountsByUser(userId),
    ]);

    const byPlan = new Map(counts.map((c) => [c.plan_id, c]));

    return plans.map((plan) => {
      const c = byPlan.get(plan.id);
      return {
        ...plan,
        workout_count: c?.total ?? 0,
        completed_count: c?.completed ?? 0,
      };
    });
  }
}

@injectable()
export class GetTrainingPlanById {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(id: string, userId: string): Promise<TrainingPlan | null> {
    return this.planRepo.findById(id, userId);
  }
}

@injectable()
export class CreateTrainingPlan {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(userId: string, input: TrainingPlanCreateInput): Promise<TrainingPlan> {
    const data: TrainingPlanCreateData = {
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      goal_type: input.goal_type,
      start_date: input.start_date,
      end_date: input.end_date,
      ftp_baseline: input.ftp_baseline ?? 250,
      status: 'active',
    };
    return this.planRepo.create(data);
  }
}

@injectable()
export class UpdateTrainingPlan {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(
    id: string,
    userId: string,
    data: Partial<TrainingPlan>,
  ): Promise<TrainingPlan | null> {
    return this.planRepo.update(id, userId, data);
  }
}

@injectable()
export class DeleteTrainingPlan {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.planRepo.delete(id, userId);
  }
}
