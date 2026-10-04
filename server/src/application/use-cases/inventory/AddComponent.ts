import { inject, injectable } from 'tsyringe';
import type {
  BikeRepository,
  ComponentRepository,
} from '../../../domain/repositories/inventory/BikeRepository.js';
import type { Component } from '../../../domain/entities/inventory/Bike.js';

export interface AddComponentInput {
  bike_id: string;
  name: string;
  category: Component['category'];
  brand?: string | null;
  model?: string | null;
  install_date: string;
  /** Odometer reading when installed. Defaults to the bike's current km. */
  install_km?: number | null;
  expected_lifespan_km?: number | null;
  notes?: string | null;
}

@injectable()
export class AddComponent {
  constructor(
    @inject('ComponentRepository') private componentRepo: ComponentRepository,
    @inject('BikeRepository') private bikeRepo: BikeRepository,
  ) {}

  async execute(userId: string, input: AddComponentInput): Promise<Component> {
    const bike = await this.bikeRepo.findById(input.bike_id);
    if (!bike || bike.user_id !== userId) {
      throw new Error('BIKE_NOT_FOUND');
    }

    const installKm = input.install_km ?? bike.current_km;

    return this.componentRepo.create({
      bike_id: input.bike_id,
      name: input.name,
      category: input.category,
      brand: input.brand ?? null,
      model: input.model ?? null,
      install_date: input.install_date,
      install_km: installKm,
      expected_lifespan_km: input.expected_lifespan_km ?? null,
      // A freshly installed component starts at the bike odometer and has no wear yet.
      current_km: bike.current_km,
      status: 'active',
      notes: input.notes ?? null,
    });
  }
}
