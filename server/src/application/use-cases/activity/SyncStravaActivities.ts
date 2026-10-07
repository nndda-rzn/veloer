import { inject, injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import type { TrainingPlanRepository } from '../../../domain/repositories/training/TrainingPlanRepository.js';
import type { StravaActivity, StravaPort } from '../../ports/StravaPort.js';
import { RefreshStravaToken } from '../auth/RefreshStravaToken.js';
import { GetGoals, RecomputeGoalProgress } from '../goals/GoalUseCases.js';
import type { Activity } from '../../../domain/entities/activity/Activity.js';
import {
  disciplineForStravaType,
  STRENGTH_STRAVA_TYPES,
} from '../../../domain/entities/activity/discipline.js';
import { computeStrengthTss } from '../../../domain/entities/activity/training-load.js';
/** Safety cap: 20 pages * 100 per page = 2000 activities on a cold first sync. */
const MAX_SYNC_PAGES = 20;

export interface SyncResult {
  synced: number;
  skipped: number;
  total: number;
  goalsUpdated: number;
  workoutsLinked: number;
}

@injectable()
export class SyncStravaActivities {
  constructor(
    @inject('ActivityRepository') private activityRepo: ActivityRepository,
    @inject('UserProfileRepository') private profileRepo: UserProfileRepository,
    @inject('TrainingPlanRepository') private planRepo: TrainingPlanRepository,
    @inject('StravaPort') private stravaPort: StravaPort,
    @inject(RefreshStravaToken) private refreshStravaToken: RefreshStravaToken,
    @inject(GetGoals) private getGoals: GetGoals,
    @inject(RecomputeGoalProgress) private recomputeGoalProgress: RecomputeGoalProgress,
  ) {}

  /** Map NP/FTP intensity ratio to a simplified zone label */
  private intensityZone(ratio: number): string {
    if (ratio < 0.55) return 'z1';
    if (ratio < 0.75) return 'z2';
    if (ratio < 0.87) return 'z3';
    if (ratio < 0.95) return 'z4';
    if (ratio < 1.05) return 'z5';
    return 'z6';
  }

  /** Return true if the activity zone is compatible with the planned workout type */
  private zoneMatchesWorkoutType(zone: string, workoutType: string): boolean {
    const map: Record<string, string[]> = {
      z1: ['recovery'],
      z2: ['endurance'],
      z3: ['tempo'],
      z4: ['sweet_spot'],
      z5: ['threshold'],
      z6: ['vo2max', 'anaerobic', 'interval', 'sprint'],
    };
    return map[zone]?.includes(workoutType) ?? false;
  }

  async execute(userId: string): Promise<SyncResult> {
    // Get valid Strava token (refresh if expired)
    const token = await this.refreshStravaToken.execute(userId);

    // Fetch user profile for FTP (needed for TSS computation)
    const profile = await this.profileRepo.findByUserId(userId);
    const ftp = profile?.ftp ?? null;

    // Incremental cursor: only pull activities at/after the newest synced ride,
    // less a 1-hour overlap so late Strava edits to the latest ride are not missed.
    const latest = await this.activityRepo.findLatestStravaActivityDate(userId);
    const after = latest ? Math.floor(new Date(latest).getTime() / 1000) - 3600 : undefined;

    const stravaActivities: StravaActivity[] = [];
    let page = 1;
    let hitPageCap = false;
    for (;;) {
      const batch = await this.stravaPort.getActivities(token.access_token, {
        page,
        perPage: 100,
        after,
      });
      stravaActivities.push(...batch);
      if (batch.length < 100) break;
      if (page >= MAX_SYNC_PAGES) {
        hitPageCap = true;
        break;
      }
      page++;
    }
    if (hitPageCap) {
      console.warn(
        `[sync] Strava pagination stopped at the ${MAX_SYNC_PAGES}-page cap (${stravaActivities.length} activities); older rides remain unsynced until the next run.`,
      );
    }

    // Keep rides and strength sessions; drop everything else (runs, swims, ...).
    const relevant = stravaActivities.filter(
      (a) =>
        a.type === 'Ride' || a.type === 'VirtualRide' || STRENGTH_STRAVA_TYPES.includes(a.type),
    );

    // One batch lookup replaces the previous per-activity N+1 findByStravaId call.
    const existingIds = await this.activityRepo.findExistingStravaIds(relevant.map((a) => a.id));

    let synced = 0;
    let skipped = 0;
    let workoutsLinked = 0;
    const toCreate: Omit<Activity, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const sa of relevant) {
      // Skip anything already stored, including duplicates appearing twice in
      // this batch (e.g. a Strava page boundary repeat).
      if (existingIds.has(sa.id)) {
        skipped++;
        continue;
      }
      existingIds.add(sa.id);

      const discipline = disciplineForStravaType(sa.type);
      const lthr = profile?.lthr ?? null;

      let tss: number | null = null;
      if (discipline === 'strength') {
        // Strength has no power; load can only come from heart rate, and is
        // null (unknown) when there is none.
        tss = computeStrengthTss({
          moving_time: sa.moving_time,
          avg_hr: sa.average_heartrate,
          max_hr: sa.max_heartrate,
          lthr,
        });
      } else {
        // Compute TSS:
        // 1. Power-based TSS if NP and FTP available (most accurate)
        // 2. hrTSS fallback if HR and LTHR available (HR-only rides)
        // 3. Estimate LTHR from max_hr if LTHR not set (80% of max HR typical threshold)
        const np = sa.weighted_average_watts || null;
        if (np && ftp && ftp > 0) {
          // Power-based TSS (most accurate)
          tss = (sa.moving_time / 3600) * Math.pow(np / ftp, 2) * 100;
        } else if (sa.average_heartrate && sa.moving_time > 0) {
          // hrTSS fallback using Coggan formula
          const avgHr = sa.average_heartrate;
          const effectiveLthr =
            lthr ?? (sa.max_heartrate ? Math.round(sa.max_heartrate * 0.88) : null);
          if (effectiveLthr && effectiveLthr > 0) {
            const hrif = avgHr / effectiveLthr; // HR Intensity Factor
            tss = (sa.moving_time / 3600) * hrif * hrif * 100;
          }
        }
      }

      const isStrength = discipline === 'strength';

      toCreate.push({
        user_id: userId,
        strava_id: sa.id,
        name: sa.name,
        type: sa.type,
        discipline,
        start_date: sa.start_date,
        // A strength session has no distance; store NULL rather than 0.
        distance: isStrength ? null : sa.distance,
        moving_time: sa.moving_time,
        elapsed_time: sa.elapsed_time,
        total_elevation_gain: sa.total_elevation_gain,
        avg_speed: sa.average_speed,
        max_speed: sa.max_speed,
        avg_hr: sa.average_heartrate || null,
        max_hr: sa.max_heartrate || null,
        polyline: sa.map?.summary_polyline || null,
        // Strength is never linked to a bike.
        bike_id: null,
        avg_cadence: sa.average_cadence || null,
        max_cadence: sa.max_cadence || null,
        avg_watts: sa.average_watts || null,
        max_watts: sa.max_watts || null,
        weighted_avg_watts: sa.weighted_average_watts || null,
        kilojoules: sa.kilojoules || null,
        device_watts: sa.device_watts ?? false,
        avg_temp: sa.average_temp ?? null,
        calories: sa.calories || null,
        elev_high: sa.elev_high || null,
        elev_low: sa.elev_low || null,
        tss,
      });
    }

    if (toCreate.length > 0) {
      const created = await this.activityRepo.createMany(toCreate);
      synced = toCreate.length;

      // Auto-link created activities to planned workouts using duration + intensity scoring
      for (const activity of created) {
        const actDate = activity.start_date.split('T')[0];
        const plannedWorkouts = await this.planRepo.findWorkoutsByDateRange(
          userId,
          actDate,
          actDate,
        );

        const isStrength = activity.discipline === 'strength';

        // Cycling only: derive intensity zone from NP/FTP ratio (falls back to avg_watts).
        const actNp = activity.weighted_avg_watts ?? activity.avg_watts ?? null;
        const actIntensity = actNp && ftp && ftp > 0 ? actNp / ftp : null;
        const actZone = actIntensity != null ? this.intensityZone(actIntensity) : null;

        let bestMatch: (typeof plannedWorkouts)[0] | null = null;
        let bestScore = -1;

        for (const w of plannedWorkouts) {
          if (w.status !== 'planned' || w.target_duration_minutes == null) continue;
          // A strength session only matches a planned strength workout, and a
          // ride only matches a planned cycling workout.
          if (w.discipline !== activity.discipline) continue;

          const durationDiffSec = Math.abs(activity.moving_time - w.target_duration_minutes * 60);
          if (durationDiffSec >= 1800) continue; // outside ±30 min: skip entirely

          let score = 0;

          // Duration scoring: closer = more points
          if (durationDiffSec < 900)
            score += 3; // within ±15 min
          else score += 1; // within ±30 min

          // Workout type vs intensity zone scoring (cycling only; strength has no power)
          if (
            !isStrength &&
            actZone != null &&
            this.zoneMatchesWorkoutType(actZone, w.workout_type)
          ) {
            score += 3;
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = w;
          }
        }

        if (bestMatch) {
          await this.planRepo.updateWorkout(bestMatch.id, userId, {
            status: 'completed',
            actual_activity_id: activity.id,
            actual_tss: activity.tss ?? null,
            actual_duration_minutes: Math.round(activity.moving_time / 60),
            completed_at: new Date().toISOString(),
          });
          workoutsLinked++;
        }
      }
    }

    // Recompute goal progress for active goals. Each goal recomputes from the
    // activities that actually fall inside its date range, so rides outside the
    // window are never counted (the previous blind sum over all new activities
    // could inflate a monthly goal with last month's rides).
    let goalsUpdated = 0;
    if (synced > 0) {
      const activeGoals = await this.getGoals.executeActive(userId);
      for (const goal of activeGoals) {
        await this.recomputeGoalProgress.execute(goal.id);
        goalsUpdated++;
      }
    }

    return {
      synced,
      skipped,
      total: relevant.length,
      goalsUpdated,
      workoutsLinked,
    };
  }
}
