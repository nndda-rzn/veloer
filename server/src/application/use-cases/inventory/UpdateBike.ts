import { inject, injectable } from 'tsyringe';
import type { BikeRepository } from '../../../domain/repositories/inventory/BikeRepository.js';
import type { Bike } from '../../../domain/entities/inventory/Bike.js';

export interface UpdateBikeInput {
  name?: string;
  brand?: string | null;
  model?: string | null;
  type?: Bike['type'];
  purchase_date?: string | null;
  purchase_price?: number | null;
  status?: Bike['status'];
  photo_url?: string | null;
  notes?: string | null;
}

@injectable()
export class UpdateBike {
  constructor(@inject('BikeRepository') private bikeRepo: BikeRepository) {}

  async execute(id: string, userId: string, input: UpdateBikeInput): Promise<Bike | null> {
    const bike = await this.bikeRepo.findById(id);
    if (!bike || bike.user_id !== userId) return null;

    return this.bikeRepo.update(id, input);
  }
}
