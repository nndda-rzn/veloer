import { inject, injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import { isCycling } from '../../../infrastructure/database/repositories/activity/cycling-filter.js';

export type FitnessAnalysisConfidence = 'high' | 'low' | 'none';
export type SuggestedTemplate =
  'BASE_BUILD_4W' | 'FTP_BUILDER_6W' | 'CENTURY_PREP_8W' | 'GRAN_FONDO_12W';

export interface FitnessAnalysis {
  estimated_ftp: number;
  ftp_confidence: FitnessAnalysisConfidence;
  avg_weekly_hours: number;
  avg_weekly_tss: number;
  ctl: number;
  activity_count: number;
  suggested_template: SuggestedTemplate;
  suggested_ftp_baseline: number;
  warnings: string[];
}

@injectable()
export class AnalyzeStravaFitness {
  constructor(
    @inject('ActivityRepository') private activityRepo: ActivityRepository,
    @inject('UserProfileRepository') private profileRepo: UserProfileRepository,
  ) {}

  async execute(userId: string): Promise<FitnessAnalysis> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Fetch all activities (56 days for CTL + volume analysis)
    const from56 = new Date(today);
    from56.setDate(from56.getDate() - 56);
    const from56Str = from56.toISOString().split('T')[0];

    const activities = await this.activityRepo.findByUserId(userId, {
      startDate: from56Str,
      endDate: todayStr,
    });

    // Fetch user profile for FTP fallback
    const profile = await this.profileRepo.findByUserId(userId);
    const profileFtp = profile?.ftp ?? 250;

    const warnings: string[] = [];
    const activityCount = activities.length;

    // ---- Estimate FTP from best weighted_avg_watts ----
    const activitiesWithPower = activities.filter(
      (a) => (a.weighted_avg_watts ?? 0) > 0 || (a.avg_watts ?? 0) > 0,
    );

    let estimatedFtp = profileFtp;
    let ftpConfidence: FitnessAnalysisConfidence = 'none';

    if (activitiesWithPower.length > 0) {
      // Best NP (or avg_watts as fallback) across all rides
      const bestNp = Math.max(
        ...activitiesWithPower.map((a) => a.weighted_avg_watts ?? a.avg_watts ?? 0),
      );
      // FTP estimate = best NP × 0.95 (standard 20-min FTP test factor)
      estimatedFtp = Math.round(bestNp * 0.95);

      if (activitiesWithPower.length >= 10) {
        ftpConfidence = 'high';
      } else {
        ftpConfidence = 'low';
        warnings.push(
          `Limited power data (${activitiesWithPower.length} rides with power). FTP estimate may not reflect current fitness.`,
        );
      }
    } else {
      warnings.push('No power data found. FTP estimate is based on your Settings value.');
    }

    if (activityCount < 5) {
      warnings.push(
        `Only ${activityCount} ${activityCount === 1 ? 'activity' : 'activities'} synced. Estimates may not be accurate. Sync more rides for better results.`,
      );
    }

    // ---- Weekly volume (hours + TSS) ----
    // Cycling only: this feeds the FTP/template suggestion, so a gym session
    // must not inflate weekly hours or the load curve.
    const cyclingActivities = activities.filter(isCycling);

    let avgWeeklyHours = 0;
    let avgWeeklyTss = 0;

    if (cyclingActivities.length > 0) {
      const totalHours = cyclingActivities.reduce((s, a) => s + a.moving_time / 3600, 0);
      const totalTss = cyclingActivities.reduce((s, a) => s + (a.tss ?? 0), 0);

      // Number of weeks covered by the data
      const dates = cyclingActivities.map((a) => new Date(a.start_date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const weeksSpan = Math.max((maxDate - minDate) / (7 * 24 * 3600 * 1000), 1);

      avgWeeklyHours = Math.round((totalHours / weeksSpan) * 10) / 10;
      avgWeeklyTss = Math.round(totalTss / weeksSpan);
    }

    if (avgWeeklyHours < 2 && activityCount >= 3) {
      warnings.push('Low weekly volume detected. Starting with Base Build is recommended.');
    }

    // ---- CTL (42-day EMA of daily TSS) ----
    const tssMap: Record<string, number> = {};
    for (const act of cyclingActivities) {
      const date = act.start_date.split('T')[0];
      tssMap[date] = (tssMap[date] ?? 0) + (act.tss ?? 0);
    }

    const decayCTL = Math.exp(-1 / 42);
    let ctl = 0;
    for (let i = 41; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      ctl = ctl * decayCTL + (tssMap[ds] ?? 0) * (1 - decayCTL);
    }
    ctl = Math.round(ctl * 10) / 10;

    // ---- Suggest template based on CTL + weekly volume ----
    let suggestedTemplate: SuggestedTemplate;
    if (ctl < 20 || activityCount < 5) {
      suggestedTemplate = 'BASE_BUILD_4W';
    } else if (ctl < 40) {
      suggestedTemplate = 'FTP_BUILDER_6W';
    } else if (avgWeeklyHours < 6) {
      suggestedTemplate = 'CENTURY_PREP_8W';
    } else {
      suggestedTemplate = 'GRAN_FONDO_12W';
    }

    return {
      estimated_ftp: estimatedFtp,
      ftp_confidence: ftpConfidence,
      avg_weekly_hours: avgWeeklyHours,
      avg_weekly_tss: avgWeeklyTss,
      ctl,
      activity_count: activityCount,
      suggested_template: suggestedTemplate,
      suggested_ftp_baseline: estimatedFtp,
      warnings,
    };
  }
}
