import { inject, injectable } from 'tsyringe';
import type { TrainingPlanRepository } from '../../../domain/repositories/training/TrainingPlanRepository.js';
import type { TrainingWorkout } from '../../../domain/entities/training/TrainingWorkout.js';

export interface RescheduleResult {
  missed: number;
  rescheduled: number;
}

@injectable()
export class AutoRescheduleMissed {
  constructor(@inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository) {}

  async execute(userId: string, planId: string): Promise<RescheduleResult> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Fetch all workouts for this plan
    const workouts = await this.planRepo.findWorkouts(planId, userId);

    // Find planned workouts with scheduled_date < today
    const overdueWorkouts = workouts.filter(
      (w) => w.status === 'planned' && w.scheduled_date < todayStr,
    );

    let missed = 0;
    let rescheduled = 0;

    for (const workout of overdueWorkouts) {
      // Mark as missed
      await this.planRepo.updateWorkout(workout.id, userId, { status: 'missed' });
      missed++;

      // Find next available date within 7 days
      const nextDate = await this.findNextAvailableDate(workouts, todayStr);
      if (!nextDate) continue;

      // Create rescheduled copy
      await this.planRepo.createWorkout({
        plan_id: workout.plan_id,
        user_id: userId,
        scheduled_date: nextDate,
        workout_type: workout.workout_type,
        title: workout.title,
        description: workout.description,
        target_duration_minutes: workout.target_duration_minutes,
        target_tss: workout.target_tss,
        target_avg_power: workout.target_avg_power,
        target_avg_hr: workout.target_avg_hr,
        target_cadence_min: workout.target_cadence_min,
        target_cadence_max: workout.target_cadence_max,
        intervals_count: workout.intervals_count,
        interval_duration_seconds: workout.interval_duration_seconds,
        interval_power_pct_ftp: workout.interval_power_pct_ftp,
        rest_duration_seconds: workout.rest_duration_seconds,
        rest_power_pct_ftp: workout.rest_power_pct_ftp,
        notes: workout.notes,
        rescheduled_from: workout.scheduled_date,
        status: 'planned',
      });
      rescheduled++;
    }

    return { missed, rescheduled };
  }

  private findNextAvailableDate(
    existingWorkouts: TrainingWorkout[],
    fromDate: string,
  ): string | null {
    const scheduledDates = new Set(
      existingWorkouts.filter((w) => w.status === 'planned').map((w) => w.scheduled_date),
    );

    for (let i = 1; i <= 7; i++) {
      const candidate = new Date(fromDate);
      candidate.setDate(candidate.getDate() + i);
      const candidateStr = candidate.toISOString().split('T')[0];
      if (!scheduledDates.has(candidateStr)) {
        return candidateStr;
      }
    }
    return null;
  }
}
