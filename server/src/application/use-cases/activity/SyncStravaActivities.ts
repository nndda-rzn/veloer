import { inject, injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import type { TrainingPlanRepository } from '../../../domain/repositories/training/TrainingPlanRepository.js';
import type { StravaPort } from '../../ports/StravaPort.js';
import { RefreshStravaToken } from '../auth/RefreshStravaToken.js';
import { GetGoals, UpdateGoalProgress } from '../goals/GoalUseCases.js';
import type { Activity } from '../../../domain/entities/activity/Activity.js';

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
    @inject(UpdateGoalProgress) private updateGoalProgress: UpdateGoalProgress,
  ) {}

  async execute(userId: string): Promise<SyncResult> {
    // Get valid Strava token (refresh if expired)
    const token = await this.refreshStravaToken.execute(userId);

    // Fetch user profile for FTP (needed for TSS computation)
    const profile = await this.profileRepo.findByUserId(userId);
    const ftp = profile?.ftp ?? null;

    // Fetch activities from Strava (last 30 activities, page 1)
    const stravaActivities = await this.stravaPort.getActivities(token.access_token, {
      page: 1,
      perPage: 30,
    });

    // Filter only Ride and VirtualRide types
    const rideActivities = stravaActivities.filter(
      (a) => a.type === 'Ride' || a.type === 'VirtualRide',
    );

    let synced = 0;
    let skipped = 0;
    let workoutsLinked = 0;
    const toCreate: Omit<Activity, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const sa of rideActivities) {
      // Check if already synced
      const existing = await this.activityRepo.findByStravaId(sa.id);
      if (existing) {
        skipped++;
        continue;
      }

      // Compute TSS from Normalized Power, moving time, and FTP
      const np = sa.weighted_average_watts || null;
      const tss =
        np && ftp && ftp > 0 ? (sa.moving_time / 3600) * Math.pow(np / ftp, 2) * 100 : null;

      toCreate.push({
        user_id: userId,
        strava_id: sa.id,
        name: sa.name,
        type: sa.type,
        start_date: sa.start_date,
        distance: sa.distance,
        moving_time: sa.moving_time,
        elapsed_time: sa.elapsed_time,
        total_elevation_gain: sa.total_elevation_gain,
        avg_speed: sa.average_speed,
        max_speed: sa.max_speed,
        avg_hr: sa.average_heartrate || null,
        max_hr: sa.max_heartrate || null,
        polyline: sa.map?.summary_polyline || null,
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

      // Auto-link created activities to planned workouts (±30 min duration tolerance)
      for (const activity of created) {
        const actDate = activity.start_date.split('T')[0];
        const plannedWorkouts = await this.planRepo.findWorkoutsByDateRange(
          userId,
          actDate,
          actDate,
        );
        const match = plannedWorkouts.find(
          (w) =>
            w.status === 'planned' &&
            w.target_duration_minutes != null &&
            Math.abs(activity.moving_time - w.target_duration_minutes * 60) < 1800,
        );
        if (match) {
          await this.planRepo.updateWorkout(match.id, userId, {
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

    // Auto-update goal progress for newly synced activities
    let goalsUpdated = 0;
    if (synced > 0) {
      const activeGoals = await this.getGoals.executeActive(userId);
      if (activeGoals.length > 0) {
        for (const goal of activeGoals) {
          let additionalValue = 0;
          for (const act of toCreate) {
            switch (goal.type) {
              case 'distance':
                additionalValue += act.distance / 1000; // km
                break;
              case 'time':
                additionalValue += act.moving_time / 3600; // hours
                break;
              case 'elevation':
                additionalValue += act.total_elevation_gain ?? 0; // meters
                break;
              case 'activities_count':
                additionalValue += 1;
                break;
            }
          }
          if (additionalValue > 0) {
            await this.updateGoalProgress.execute(goal.id, additionalValue);
            goalsUpdated++;
          }
        }
      }
    }

    return {
      synced,
      skipped,
      total: rideActivities.length,
      goalsUpdated,
      workoutsLinked,
    };
  }
}
