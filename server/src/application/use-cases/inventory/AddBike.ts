import { inject, injectable } from 'tsyringe';
import type { BikeRepository } from '../../../domain/repositories/inventory/BikeRepository.js';
import type { Bike } from '../../../domain/entities/inventory/Bike.js';

export interface AddBikeInput {
  name: string;
  brand?: string | null;
  model?: string | null;
  type: Bike['type'];
  purchase_date?: string | null;
  purchase_price?: number | null;
  photo_url?: string | null;
  notes?: string | null;
}

@injectable()
export class AddBike {
  constructor(@inject('BikeRepository') private bikeRepo: BikeRepository) {}

  async execute(userId: string, input: AddBikeInput): Promise<Bike> {
    return this.bikeRepo.create({
      user_id: userId,
      name: input.name,
      brand: input.brand ?? null,
      model: input.model ?? null,
      type: input.type,
      purchase_date: input.purchase_date ?? null,
      purchase_price: input.purchase_price ?? null,
      status: 'active',
      photo_url: input.photo_url ?? null,
      notes: input.notes ?? null,
    });
  }
}
