import { inject, injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';
import type { Activity } from '../../../domain/entities/activity/Activity.js';

export interface GetActivitiesOptions {
  limit?: number;
  offset?: number;
  bikeId?: string;
  startDate?: string;
  endDate?: string;
}

@injectable()
export class GetActivities {
  constructor(@inject('ActivityRepository') private activityRepo: ActivityRepository) {}

  async execute(userId: string, options?: GetActivitiesOptions): Promise<Activity[]> {
    return this.activityRepo.findByUserId(userId, options);
  }
}
