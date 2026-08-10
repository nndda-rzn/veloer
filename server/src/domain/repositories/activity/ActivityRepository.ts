import type { Activity } from '../../entities/activity/Activity.js';

export interface ActivityRepository {
  findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      bikeId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Activity[]>;
  findById(id: string): Promise<Activity | null>;
  findByStravaId(stravaId: number): Promise<Activity | null>;
  create(data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity>;
  createMany(data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>[]): Promise<Activity[]>;
  updateBikeId(activityId: string, bikeId: string | null): Promise<void>;
  getStats(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalDistance: number;
    totalMovingTime: number;
    totalElevationGain: number;
    count: number;
  }>;
}
