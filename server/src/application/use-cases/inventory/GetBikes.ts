import { inject, injectable } from 'tsyringe';
import type { BikeRepository } from '../../../domain/repositories/inventory/BikeRepository.js';
import type { Bike } from '../../../domain/entities/inventory/Bike.js';

@injectable()
export class GetBikes {
  constructor(@inject('BikeRepository') private bikeRepo: BikeRepository) {}

  async execute(userId: string): Promise<BikeWithAlerts[]> {
    const bikes = await this.bikeRepo.findByUserId(userId);
    if (bikes.length === 0) return [];

    const alertCounts = await this.bikeRepo.findMaintenanceAlertCounts(bikes.map((b) => b.id));

    return bikes.map((bike) => ({
      ...bike,
      maintenance_alert_count: alertCounts[bike.id] ?? 0,
    }));
  }
}

export interface BikeWithAlerts extends Bike {
  maintenance_alert_count: number;
}

@injectable()
export class GetBikeById {
  constructor(@inject('BikeRepository') private bikeRepo: BikeRepository) {}

  async execute(id: string, userId: string): Promise<Bike | null> {
    const bike = await this.bikeRepo.findById(id);
    if (!bike || bike.user_id !== userId) return null;
    return bike;
  }
}
