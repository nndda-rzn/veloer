import { inject, injectable } from 'tsyringe';
import type { BikeRepository } from '../../../domain/repositories/inventory/BikeRepository.js';
import type { Bike } from '../../../domain/entities/inventory/Bike.js';

@injectable()
export class GetBikes {
  constructor(@inject('BikeRepository') private bikeRepo: BikeRepository) {}

  async execute(userId: string): Promise<Bike[]> {
    return this.bikeRepo.findByUserId(userId);
  }
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
