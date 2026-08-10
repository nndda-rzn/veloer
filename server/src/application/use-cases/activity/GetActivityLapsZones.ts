import { inject, injectable } from 'tsyringe';
import type { StravaPort } from '../../ports/StravaPort.js';
import type { StravaLap, StravaZone } from '../../ports/StravaPort.js';
import { RefreshStravaToken } from '../auth/RefreshStravaToken.js';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';

@injectable()
export class GetActivityLaps {
  constructor(
    @inject('StravaPort') private stravaPort: StravaPort,
    @inject(RefreshStravaToken) private refreshStravaToken: RefreshStravaToken,
    @inject('ActivityRepository') private activityRepo: ActivityRepository,
  ) {}

  async execute(activityId: string, userId: string): Promise<StravaLap[]> {
    const activity = await this.activityRepo.findById(activityId);
    if (!activity || activity.user_id !== userId || !activity.strava_id) {
      throw new Error('Activity not found or no Strava data');
    }

    const token = await this.refreshStravaToken.execute(userId);
    return this.stravaPort.getActivityLaps(token.access_token, activity.strava_id);
  }
}

@injectable()
export class GetActivityZones {
  constructor(
    @inject('StravaPort') private stravaPort: StravaPort,
    @inject(RefreshStravaToken) private refreshStravaToken: RefreshStravaToken,
    @inject('ActivityRepository') private activityRepo: ActivityRepository,
  ) {}

  async execute(activityId: string, userId: string): Promise<StravaZone[]> {
    const activity = await this.activityRepo.findById(activityId);
    if (!activity || activity.user_id !== userId || !activity.strava_id) {
      throw new Error('Activity not found or no Strava data');
    }

    const token = await this.refreshStravaToken.execute(userId);
    return this.stravaPort.getActivityZones(token.access_token, activity.strava_id);
  }
}
