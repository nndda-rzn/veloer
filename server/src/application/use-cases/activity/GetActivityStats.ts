import { inject, injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';

export interface ActivityStats {
  totalDistance: number;
  totalMovingTime: number;
  totalElevationGain: number;
  count: number;
}

@injectable()
export class GetActivityStats {
  constructor(@inject('ActivityRepository') private activityRepo: ActivityRepository) {}

  async execute(userId: string, startDate?: string, endDate?: string): Promise<ActivityStats> {
    return this.activityRepo.getStats(userId, startDate, endDate);
  }
}
