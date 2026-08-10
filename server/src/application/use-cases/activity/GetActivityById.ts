import { inject, injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';
import type { Activity } from '../../../domain/entities/activity/Activity.js';

@injectable()
export class GetActivityById {
  constructor(@inject('ActivityRepository') private activityRepo: ActivityRepository) {}

  async execute(id: string, userId: string): Promise<Activity | null> {
    const activity = await this.activityRepo.findById(id);
    if (!activity || activity.user_id !== userId) {
      return null;
    }
    return activity;
  }
}
