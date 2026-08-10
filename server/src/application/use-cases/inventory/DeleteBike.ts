import { inject, injectable } from 'tsyringe';
import type { BikeRepository } from '../../../domain/repositories/inventory/BikeRepository.js';

@injectable()
export class DeleteBike {
  constructor(@inject('BikeRepository') private bikeRepo: BikeRepository) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const bike = await this.bikeRepo.findById(id);
    if (!bike || bike.user_id !== userId) return false;

    await this.bikeRepo.delete(id);
    return true;
  }
}
