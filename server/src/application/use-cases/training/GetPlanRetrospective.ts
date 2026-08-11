import { inject, injectable } from 'tsyringe';
import type { TrainingPlanRepository } from '../../../domain/repositories/training/TrainingPlanRepository.js';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import type { TrainingPlan } from '../../../domain/entities/training/TrainingPlan.js';

export interface WeeklyBreakdown {
  week: string; // e.g. "2026-W32"
  planned_tss: number;
  actual_tss: number;
  completed: number;
  total: number;
}

export interface PlanRetrospectiveResult {
  plan: TrainingPlan;
  summary: {
    total_workouts: number;
    completed: number;
    skipped: number;
    missed: number;
    completion_rate: number;
    planned_tss_total: number;
    actual_tss_total: number;
    tss_compliance: number;
    planned_hours_total: number;
    actual_hours_total: number;
    ftp_change: number | null;
  };
  weekly_breakdown: WeeklyBreakdown[];
}

@injectable()
export class GetPlanRetrospective {
  constructor(
    @inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository,
    @inject('UserProfileRepository') private profileRepo: UserProfileRepository,
  ) {}

  async execute(planId: string, userId: string): Promise<PlanRetrospectiveResult | null> {
    const plan = await this.planRepo.findById(planId, userId);
    if (!plan) return null;

    const workouts = await this.planRepo.findWorkouts(planId, userId);
    const profile = await this.profileRepo.findByUserId(userId);
    const currentFtp = profile?.ftp ?? null;

    // Aggregate stats
    const total_workouts = workouts.length;
    const completed = workouts.filter((w) => w.status === 'completed').length;
    const skipped = workouts.filter((w) => w.status === 'skipped').length;
    const missed = workouts.filter((w) => w.status === 'missed').length;
    const completion_rate = total_workouts > 0 ? Math.round((completed / total_workouts) * 100) : 0;

    const planned_tss_total = workouts.reduce((s, w) => s + (w.target_tss ?? 0), 0);
    const actual_tss_total = workouts.reduce((s, w) => s + (w.actual_tss ?? 0), 0);
    const tss_compliance =
      planned_tss_total > 0 ? Math.round((actual_tss_total / planned_tss_total) * 100) : 0;

    const planned_hours_total =
      workouts.reduce((s, w) => s + (w.target_duration_minutes ?? 0), 0) / 60;
    const actual_hours_total =
      workouts.reduce((s, w) => s + (w.actual_duration_minutes ?? 0), 0) / 60;

    const ftp_change = currentFtp != null ? currentFtp - plan.ftp_baseline : null;

    // Weekly breakdown
    const weekMap: Record<string, WeeklyBreakdown> = {};
    for (const w of workouts) {
      const weekKey = this.getISOWeek(w.scheduled_date);
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = {
          week: weekKey,
          planned_tss: 0,
          actual_tss: 0,
          completed: 0,
          total: 0,
        };
      }
      weekMap[weekKey].total++;
      weekMap[weekKey].planned_tss += w.target_tss ?? 0;
      weekMap[weekKey].actual_tss += w.actual_tss ?? 0;
      if (w.status === 'completed') weekMap[weekKey].completed++;
    }

    const weekly_breakdown = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));

    return {
      plan,
      summary: {
        total_workouts,
        completed,
        skipped,
        missed,
        completion_rate,
        planned_tss_total: Math.round(planned_tss_total),
        actual_tss_total: Math.round(actual_tss_total),
        tss_compliance,
        planned_hours_total: Math.round(planned_hours_total * 10) / 10,
        actual_hours_total: Math.round(actual_hours_total * 10) / 10,
        ftp_change,
      },
      weekly_breakdown,
    };
  }

  private getISOWeek(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const weekNum = Math.ceil(
      ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
    );
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  }
}
