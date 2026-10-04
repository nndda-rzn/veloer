import { inject, injectable } from 'tsyringe';
import type { TrainingPlanRepository } from '../../../domain/repositories/training/TrainingPlanRepository.js';
import type {
  TrainingWorkout,
  TrainingWorkoutCreateData,
} from '../../../domain/entities/training/TrainingWorkout.js';

export interface WorkoutCreateInput {
  plan_id: string;
  scheduled_date: string;
  discipline?: TrainingWorkout['discipline'];
  workout_type: TrainingWorkout['workout_type'];
  title: string;
  description?: string | null;
  target_duration_minutes?: number | null;
  target_tss?: number | null;
  target_avg_power?: number | null;
  target_avg_hr?: number | null;
  target_cadence_min?: number | null;
  target_cadence_max?: number | null;
  intervals_count?: number | null;
  interval_duration_seconds?: number | null;
  interval_power_pct_ftp?: number | null;
  rest_duration_seconds?: number | null;
  rest_power_pct_ftp?: number | null;
  exercises?: TrainingWorkout['exercises'];
  notes?: string | null;
}

@injectable()
export class GetWorkouts {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(planId: string, userId: string): Promise<TrainingWorkout[]> {
    return this.planRepo.findWorkouts(planId, userId);
  }
}

@injectable()
export class GetWorkoutById {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(id: string, userId: string): Promise<TrainingWorkout | null> {
    return this.planRepo.findWorkoutById(id, userId);
  }
}

@injectable()
export class CreateWorkout {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(userId: string, input: WorkoutCreateInput): Promise<TrainingWorkout> {
    const data: TrainingWorkoutCreateData = {
      plan_id: input.plan_id,
      user_id: userId,
      scheduled_date: input.scheduled_date,
      discipline: input.discipline ?? 'cycling',
      workout_type: input.workout_type,
      title: input.title,
      description: input.description ?? null,
      target_duration_minutes: input.target_duration_minutes ?? null,
      target_tss: input.target_tss ?? null,
      target_avg_power: input.target_avg_power ?? null,
      target_avg_hr: input.target_avg_hr ?? null,
      target_cadence_min: input.target_cadence_min ?? null,
      target_cadence_max: input.target_cadence_max ?? null,
      intervals_count: input.intervals_count ?? null,
      interval_duration_seconds: input.interval_duration_seconds ?? null,
      interval_power_pct_ftp: input.interval_power_pct_ftp ?? null,
      rest_duration_seconds: input.rest_duration_seconds ?? null,
      rest_power_pct_ftp: input.rest_power_pct_ftp ?? null,
      exercises: input.exercises ?? null,
      notes: input.notes ?? null,
      status: 'planned',
    };
    return this.planRepo.createWorkout(data);
  }
}

@injectable()
export class UpdateWorkout {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(
    id: string,
    userId: string,
    data: Partial<TrainingWorkout>,
  ): Promise<TrainingWorkout | null> {
    return this.planRepo.updateWorkout(id, userId, data);
  }
}

@injectable()
export class DeleteWorkout {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.planRepo.deleteWorkout(id, userId);
  }
}
