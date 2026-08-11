import { inject, injectable } from 'tsyringe';
import type { TrainingPlanRepository } from '../../../domain/repositories/training/TrainingPlanRepository.js';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import type { TrainingPlan } from '../../../domain/entities/training/TrainingPlan.js';
import type {
  TrainingWorkoutCreateData,
  WorkoutType,
} from '../../../domain/entities/training/TrainingWorkout.js';

export type TemplateKey = 'BASE_BUILD_4W' | 'FTP_BUILDER_6W' | 'CENTURY_PREP_8W' | 'GRAN_FONDO_12W';

export interface TemplateInfo {
  key: TemplateKey;
  title: string;
  description: string;
  weeks: number;
  goal_type: TrainingPlan['goal_type'];
  workouts_per_week: number;
  focus: string;
}

export const TEMPLATES: Record<TemplateKey, TemplateInfo> = {
  BASE_BUILD_4W: {
    key: 'BASE_BUILD_4W',
    title: 'Base Build — 4 Weeks',
    description: 'Progressive Z2 endurance volume. Build aerobic base with 3-4 rides/week.',
    weeks: 4,
    goal_type: 'endurance',
    workouts_per_week: 4,
    focus: 'Aerobic base',
  },
  FTP_BUILDER_6W: {
    key: 'FTP_BUILDER_6W',
    title: 'FTP Builder — 6 Weeks',
    description: 'Sweet spot and threshold intervals. Designed to raise FTP progressively.',
    weeks: 6,
    goal_type: 'ftp',
    workouts_per_week: 4,
    focus: 'FTP / Threshold',
  },
  CENTURY_PREP_8W: {
    key: 'CENTURY_PREP_8W',
    title: 'Century Prep — 8 Weeks',
    description: 'Build endurance for a 100-160km event. Long rides with progressive overload.',
    weeks: 8,
    goal_type: 'century',
    workouts_per_week: 4,
    focus: 'Long ride endurance',
  },
  GRAN_FONDO_12W: {
    key: 'GRAN_FONDO_12W',
    title: 'Gran Fondo — 12 Weeks',
    description: 'Full periodized plan: base → build → peak → taper. Ideal for gran fondo events.',
    weeks: 12,
    goal_type: 'gran_fondo',
    workouts_per_week: 5,
    focus: 'Periodized peak performance',
  },
};

interface WeeklyPattern {
  day_offset: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  workout_type: WorkoutType;
  title: string;
  duration_minutes: number;
  tss: number;
  intervals_count?: number;
  interval_duration_seconds?: number;
  interval_power_pct_ftp?: number;
  rest_duration_seconds?: number;
  rest_power_pct_ftp?: number;
}

// Progressive multipliers per week block (4-week cycle)
const WEEKLY_LOAD_MULTIPLIER = [1.0, 1.1, 1.2, 0.7]; // Build-build-build-recovery

function getWeeklyPattern(template: TemplateKey, week: number): WeeklyPattern[] {
  const phase = Math.floor((week - 1) / 4); // 0=base, 1=build, 2=peak, 3=taper
  const multiplier = WEEKLY_LOAD_MULTIPLIER[(week - 1) % 4];

  switch (template) {
    case 'BASE_BUILD_4W':
      return [
        {
          day_offset: 0,
          workout_type: 'endurance',
          title: 'Z2 Endurance Ride',
          duration_minutes: Math.round(60 * multiplier),
          tss: Math.round(55 * multiplier),
        },
        {
          day_offset: 2,
          workout_type: 'endurance',
          title: 'Aerobic Base Ride',
          duration_minutes: Math.round(75 * multiplier),
          tss: Math.round(65 * multiplier),
        },
        {
          day_offset: 4,
          workout_type: 'tempo',
          title: 'Tempo Effort',
          duration_minutes: Math.round(70 * multiplier),
          tss: Math.round(70 * multiplier),
        },
        {
          day_offset: 6,
          workout_type: 'endurance',
          title: 'Long Endurance Ride',
          duration_minutes: Math.round(120 * multiplier),
          tss: Math.round(90 * multiplier),
        },
      ];

    case 'FTP_BUILDER_6W':
      return [
        {
          day_offset: 0,
          workout_type: 'endurance',
          title: 'Z2 Base',
          duration_minutes: 60,
          tss: Math.round(55 * multiplier),
        },
        {
          day_offset: 1,
          workout_type: 'sweet_spot',
          title: 'Sweet Spot Intervals',
          duration_minutes: Math.round(75 * multiplier),
          tss: Math.round(85 * multiplier),
          intervals_count: 3,
          interval_duration_seconds: 600,
          interval_power_pct_ftp: 90,
          rest_duration_seconds: 300,
          rest_power_pct_ftp: 55,
        },
        {
          day_offset: 3,
          workout_type: 'recovery',
          title: 'Active Recovery',
          duration_minutes: 45,
          tss: 20,
        },
        {
          day_offset: 5,
          workout_type: 'threshold',
          title: '2×20 Threshold',
          duration_minutes: Math.round(70 * multiplier),
          tss: Math.round(80 * multiplier),
          intervals_count: 2,
          interval_duration_seconds: 1200,
          interval_power_pct_ftp: 100,
          rest_duration_seconds: 300,
          rest_power_pct_ftp: 55,
        },
      ];

    case 'CENTURY_PREP_8W': {
      const longRideDuration = Math.min(240, Math.round((60 + week * 15) * multiplier));
      return [
        {
          day_offset: 0,
          workout_type: 'recovery',
          title: 'Recovery Spin',
          duration_minutes: 45,
          tss: 20,
        },
        {
          day_offset: 1,
          workout_type: 'endurance',
          title: 'Aerobic Endurance',
          duration_minutes: Math.round(90 * multiplier),
          tss: Math.round(75 * multiplier),
        },
        {
          day_offset: 3,
          workout_type: 'tempo',
          title: 'Tempo Ride',
          duration_minutes: Math.round(75 * multiplier),
          tss: Math.round(75 * multiplier),
        },
        {
          day_offset: 6,
          workout_type: 'endurance',
          title: `Long Ride (${longRideDuration} min)`,
          duration_minutes: longRideDuration,
          tss: Math.round(longRideDuration * 0.7),
        },
      ];
    }

    case 'GRAN_FONDO_12W': {
      if (phase === 0) {
        // Base phase (weeks 1-4)
        return [
          {
            day_offset: 0,
            workout_type: 'endurance',
            title: 'Z2 Base',
            duration_minutes: Math.round(60 * multiplier),
            tss: Math.round(55 * multiplier),
          },
          {
            day_offset: 2,
            workout_type: 'endurance',
            title: 'Aerobic Ride',
            duration_minutes: Math.round(90 * multiplier),
            tss: Math.round(70 * multiplier),
          },
          {
            day_offset: 3,
            workout_type: 'tempo',
            title: 'Tempo Effort',
            duration_minutes: Math.round(70 * multiplier),
            tss: Math.round(70 * multiplier),
          },
          {
            day_offset: 5,
            workout_type: 'endurance',
            title: 'Long Endurance',
            duration_minutes: Math.round(120 * multiplier),
            tss: Math.round(90 * multiplier),
          },
          {
            day_offset: 6,
            workout_type: 'recovery',
            title: 'Recovery Ride',
            duration_minutes: 45,
            tss: 20,
          },
        ];
      } else if (phase === 1) {
        // Build phase (weeks 5-8)
        return [
          {
            day_offset: 0,
            workout_type: 'endurance',
            title: 'Z2 Base',
            duration_minutes: 60,
            tss: Math.round(55 * multiplier),
          },
          {
            day_offset: 1,
            workout_type: 'threshold',
            title: 'Threshold Intervals',
            duration_minutes: Math.round(75 * multiplier),
            tss: Math.round(85 * multiplier),
            intervals_count: 2,
            interval_duration_seconds: 1200,
            interval_power_pct_ftp: 100,
            rest_duration_seconds: 300,
            rest_power_pct_ftp: 55,
          },
          {
            day_offset: 3,
            workout_type: 'sweet_spot',
            title: 'Sweet Spot',
            duration_minutes: Math.round(80 * multiplier),
            tss: Math.round(85 * multiplier),
          },
          {
            day_offset: 5,
            workout_type: 'endurance',
            title: 'Long Ride',
            duration_minutes: Math.round(150 * multiplier),
            tss: Math.round(110 * multiplier),
          },
          {
            day_offset: 6,
            workout_type: 'recovery',
            title: 'Recovery Spin',
            duration_minutes: 45,
            tss: 20,
          },
        ];
      } else if (phase === 2) {
        // Peak phase (weeks 9-11)
        return [
          {
            day_offset: 0,
            workout_type: 'recovery',
            title: 'Recovery Spin',
            duration_minutes: 45,
            tss: 20,
          },
          {
            day_offset: 1,
            workout_type: 'vo2max',
            title: 'VO2 Max Intervals',
            duration_minutes: Math.round(60 * multiplier),
            tss: Math.round(80 * multiplier),
            intervals_count: 5,
            interval_duration_seconds: 240,
            interval_power_pct_ftp: 115,
            rest_duration_seconds: 240,
            rest_power_pct_ftp: 55,
          },
          {
            day_offset: 3,
            workout_type: 'threshold',
            title: 'Threshold Ride',
            duration_minutes: Math.round(75 * multiplier),
            tss: Math.round(85 * multiplier),
          },
          {
            day_offset: 5,
            workout_type: 'endurance',
            title: 'Peak Long Ride',
            duration_minutes: Math.round(180 * multiplier),
            tss: Math.round(130 * multiplier),
          },
          {
            day_offset: 6,
            workout_type: 'recovery',
            title: 'Easy Recovery',
            duration_minutes: 45,
            tss: 20,
          },
        ];
      } else {
        // Taper (week 12)
        return [
          {
            day_offset: 0,
            workout_type: 'recovery',
            title: 'Easy Spin',
            duration_minutes: 40,
            tss: 18,
          },
          {
            day_offset: 2,
            workout_type: 'tempo',
            title: 'Race Prep Tempo',
            duration_minutes: 50,
            tss: 45,
          },
          {
            day_offset: 4,
            workout_type: 'endurance',
            title: 'Easy Endurance',
            duration_minutes: 60,
            tss: 40,
          },
          {
            day_offset: 6,
            workout_type: 'recovery',
            title: 'Pre-Event Spin',
            duration_minutes: 30,
            tss: 15,
          },
        ];
      }
    }
  }
}

export interface GenerateFromTemplateInput {
  template: TemplateKey;
  start_date: string;
  title?: string;
  userId: string;
}

@injectable()
export class GeneratePlanFromTemplate {
  constructor(
    @inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository,
    @inject('UserProfileRepository') private profileRepo: UserProfileRepository,
  ) {}

  async execute(input: GenerateFromTemplateInput): Promise<TrainingPlan> {
    const { template, start_date, userId } = input;
    const templateInfo = TEMPLATES[template];

    const profile = await this.profileRepo.findByUserId(userId);
    const ftp = profile?.ftp ?? 250;

    // Compute end_date
    const start = new Date(start_date);
    const end = new Date(start);
    end.setDate(end.getDate() + templateInfo.weeks * 7 - 1);
    const end_date = end.toISOString().split('T')[0];

    // Create the plan
    const plan = await this.planRepo.create({
      user_id: userId,
      title: input.title ?? templateInfo.title,
      description: templateInfo.description,
      goal_type: templateInfo.goal_type,
      start_date,
      end_date,
      ftp_baseline: ftp,
      status: 'active',
    });

    // Generate workouts for each week
    const workoutsToCreate: TrainingWorkoutCreateData[] = [];

    for (let week = 1; week <= templateInfo.weeks; week++) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

      // Get weekday of start_date to align with Monday
      const startDay = weekStart.getDay(); // 0=Sun
      const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
      const monday = new Date(weekStart);
      monday.setDate(monday.getDate() + mondayOffset);

      const patterns = getWeeklyPattern(template, week);

      for (const p of patterns) {
        const workoutDate = new Date(monday);
        workoutDate.setDate(workoutDate.getDate() + p.day_offset);

        // Don't schedule before plan start
        if (workoutDate < start) continue;

        workoutsToCreate.push({
          plan_id: plan.id,
          user_id: userId,
          scheduled_date: workoutDate.toISOString().split('T')[0],
          workout_type: p.workout_type,
          title: p.title,
          description: null,
          target_duration_minutes: p.duration_minutes,
          target_tss: p.tss,
          target_avg_power: p.workout_type !== 'recovery' ? Math.round(ftp * 0.75) : null,
          target_avg_hr: null,
          target_cadence_min: 85,
          target_cadence_max: 95,
          intervals_count: p.intervals_count ?? null,
          interval_duration_seconds: p.interval_duration_seconds ?? null,
          interval_power_pct_ftp: p.interval_power_pct_ftp ?? null,
          rest_duration_seconds: p.rest_duration_seconds ?? null,
          rest_power_pct_ftp: p.rest_power_pct_ftp ?? null,
          notes: null,
          status: 'planned',
        });
      }
    }

    // Batch create all workouts
    for (const workout of workoutsToCreate) {
      await this.planRepo.createWorkout(workout);
    }

    return plan;
  }
}
