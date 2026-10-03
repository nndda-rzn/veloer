import { inject, injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import type { TrainingPlanRepository } from '../../../domain/repositories/training/TrainingPlanRepository.js';
import type { WorkoutType } from '../../../domain/entities/training/TrainingWorkout.js';

export interface RecommendationMetrics {
  ctl: number;
  atl: number;
  tsb: number;
  weekly_tss: number;
  weekly_hours: number;
  days_since_last_ride: number;
  consecutive_days: number;
}

export interface WorkoutRecommendation {
  workout_type: WorkoutType;
  title: string;
  description: string;
  reason: string;
  target_duration_minutes: number;
  target_tss: number;
  target_avg_power: number | null;
  target_avg_hr: number | null;
  intervals?: {
    count: number;
    duration_seconds: number;
    power_pct_ftp: number;
    rest_seconds: number;
    rest_pct_ftp: number;
  };
  metrics: RecommendationMetrics;
}

@injectable()
export class GenerateRecommendation {
  constructor(
    @inject('ActivityRepository') private activityRepo: ActivityRepository,
    @inject('UserProfileRepository') private profileRepo: UserProfileRepository,
    @inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository,
  ) {}

  async execute(userId: string): Promise<WorkoutRecommendation> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Fetch 42 days of activities for CTL/ATL computation
    const from42 = new Date(today);
    from42.setDate(from42.getDate() - 42);
    const from42Str = from42.toISOString().split('T')[0];

    const activities = await this.activityRepo.findByUserId(userId, {
      startDate: from42Str,
      endDate: todayStr,
    });

    // Fetch user FTP
    const profile = await this.profileRepo.findByUserId(userId);
    const ftp = profile?.ftp ?? 250;

    // Build TSS-per-day map
    const tssMap: Record<string, number> = {};
    let lastRideDate: Date | null = null;

    for (const act of activities) {
      const date = act.start_date.split('T')[0];
      tssMap[date] = (tssMap[date] ?? 0) + (act.tss ?? 0);
      const actDate = new Date(date);
      if (!lastRideDate || actDate > lastRideDate) lastRideDate = actDate;
    }

    // Build 42-day array ordered oldest→newest
    const days42: { date: string; tss: number }[] = [];
    for (let i = 41; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days42.push({ date: ds, tss: tssMap[ds] ?? 0 });
    }

    // CTL: 42-day EMA (decay = e^(-1/42))
    const decayCTL = Math.exp(-1 / 42);
    let ctl = 0;
    for (const { tss } of days42) {
      ctl = ctl * decayCTL + tss * (1 - decayCTL);
    }

    // ATL: 7-day EMA (decay = e^(-1/7))
    const decayATL = Math.exp(-1 / 7);
    let atl = 0;
    const days7 = days42.slice(-7);
    for (const { tss } of days7) {
      atl = atl * decayATL + tss * (1 - decayATL);
    }

    // TSB = CTL - ATL
    const tsb = ctl - atl;

    // Weekly totals
    const weekly_tss = days7.reduce((s, d) => s + d.tss, 0);
    const weekly_hours =
      activities
        .filter((a) => {
          const d = a.start_date.split('T')[0];
          return days7.some((day) => day.date === d);
        })
        .reduce((s, a) => s + a.moving_time, 0) / 3600;

    // Days since last ride
    const days_since_last_ride = lastRideDate
      ? Math.floor((today.getTime() - lastRideDate.getTime()) / 86400000)
      : 999;

    // Consecutive days riding
    let consecutive_days = 0;
    for (let i = days42.length - 1; i >= 0; i--) {
      if (days42[i].tss > 0) {
        consecutive_days++;
      } else {
        break;
      }
    }

    // Workout types done this week
    const weekWorkouts = await this.planRepo.findWorkoutsByDateRange(
      userId,
      days7[0].date,
      todayStr,
    );
    const completedTypes = new Set(
      weekWorkouts.filter((w) => w.status === 'completed').map((w) => w.workout_type),
    );

    const metrics: RecommendationMetrics = {
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round(tsb * 10) / 10,
      weekly_tss: Math.round(weekly_tss),
      weekly_hours: Math.round(weekly_hours * 10) / 10,
      days_since_last_ride,
      consecutive_days,
    };

    return this.decide(tsb, consecutive_days, weekly_hours, completedTypes, ftp, metrics);
  }

  private decide(
    tsb: number,
    consecutiveDays: number,
    weeklyHours: number,
    completedTypes: Set<WorkoutType>,
    ftp: number,
    metrics: RecommendationMetrics,
  ): WorkoutRecommendation {
    // Override: too many consecutive days
    if (consecutiveDays >= 3) {
      return this.recovery('3 consecutive days riding. Active recovery recommended', ftp, metrics);
    }

    if (tsb < -30) {
      return this.recovery('High fatigue (TSB < -30). Prioritize recovery', ftp, metrics);
    }

    if (tsb < -15) {
      return {
        workout_type: 'endurance',
        title: 'Z2 Endurance Ride',
        description: 'Steady aerobic effort at 65-75% FTP. Keep HR in zone 2.',
        reason: `Build phase fatigue (TSB ${metrics.tsb}). Maintain aerobic base.`,
        target_duration_minutes: 105,
        target_tss: 70,
        target_avg_power: Math.round(ftp * 0.68),
        target_avg_hr: null,
        metrics,
      };
    }

    if (tsb >= -15 && tsb <= 5) {
      if (!completedTypes.has('threshold') && weeklyHours >= 4) {
        return {
          workout_type: 'threshold',
          title: '2×20 Threshold Intervals',
          description: '2 sets of 20 minutes at 95-105% FTP with 5 min recovery.',
          reason: `Aerobic base ready (TSB ${metrics.tsb}). Time to raise FTP.`,
          target_duration_minutes: 60,
          target_tss: 85,
          target_avg_power: Math.round(ftp * 1.0),
          target_avg_hr: null,
          intervals: {
            count: 2,
            duration_seconds: 1200,
            power_pct_ftp: 100,
            rest_seconds: 300,
            rest_pct_ftp: 55,
          },
          metrics,
        };
      }
      if (!completedTypes.has('vo2max') && tsb > -5) {
        return {
          workout_type: 'vo2max',
          title: '5×4 VO2 Max Intervals',
          description: '5 sets of 4 minutes at 110-120% FTP with 4 min easy recovery.',
          reason: `Neutral TSB (${metrics.tsb}). Optimal for high-intensity work.`,
          target_duration_minutes: 50,
          target_tss: 75,
          target_avg_power: Math.round(ftp * 1.15),
          target_avg_hr: null,
          intervals: {
            count: 5,
            duration_seconds: 240,
            power_pct_ftp: 115,
            rest_seconds: 240,
            rest_pct_ftp: 55,
          },
          metrics,
        };
      }
      return {
        workout_type: 'sweet_spot',
        title: 'Sweet Spot Ride',
        description: 'Sustained effort at 88-93% FTP. High training value per hour.',
        reason: `Balanced fatigue (TSB ${metrics.tsb}). Sweet spot is most efficient.`,
        target_duration_minutes: 75,
        target_tss: 90,
        target_avg_power: Math.round(ftp * 0.9),
        target_avg_hr: null,
        metrics,
      };
    }

    if (tsb > 5 && tsb < 20) {
      return {
        workout_type: 'tempo',
        title: 'Tempo Ride',
        description: 'Comfortably hard effort at 76-87% FTP. Aerobic power development.',
        reason: `Positive form (TSB ${metrics.tsb}). Good day for quality work.`,
        target_duration_minutes: 80,
        target_tss: 80,
        target_avg_power: Math.round(ftp * 0.82),
        target_avg_hr: null,
        metrics,
      };
    }

    // TSB >= 20: very fresh
    return {
      workout_type: 'anaerobic',
      title: 'Anaerobic Sprint Session',
      description: '6×30 second all-out sprints with 4.5 min easy recovery.',
      reason: `Very fresh (TSB ${metrics.tsb}). Ideal for maximum intensity work.`,
      target_duration_minutes: 45,
      target_tss: 65,
      target_avg_power: null,
      target_avg_hr: null,
      intervals: {
        count: 6,
        duration_seconds: 30,
        power_pct_ftp: 175,
        rest_seconds: 270,
        rest_pct_ftp: 40,
      },
      metrics,
    };
  }

  private recovery(
    reason: string,
    ftp: number,
    metrics: RecommendationMetrics,
  ): WorkoutRecommendation {
    return {
      workout_type: 'recovery',
      title: 'Active Recovery Ride',
      description: 'Very easy spin at 50-60% FTP. Flush legs, boost circulation.',
      reason,
      target_duration_minutes: 50,
      target_tss: 25,
      target_avg_power: Math.round(ftp * 0.55),
      target_avg_hr: null,
      metrics,
    };
  }
}
