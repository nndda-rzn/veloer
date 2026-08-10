import { inject, injectable } from 'tsyringe';
import type { ComponentRepository } from '../../../domain/repositories/inventory/BikeRepository.js';
import type { Component } from '../../../domain/entities/inventory/Bike.js';

export interface AddComponentInput {
  bike_id: string;
  name: string;
  category: Component['category'];
  brand?: string | null;
  model?: string | null;
  install_date: string;
  install_km: number;
  expected_lifespan_km?: number | null;
  notes?: string | null;
}

@injectable()
export class AddComponent {
  constructor(@inject('ComponentRepository') private componentRepo: ComponentRepository) {}

  async execute(input: AddComponentInput): Promise<Component> {
    return this.componentRepo.create({
      bike_id: input.bike_id,
      name: input.name,
      category: input.category,
      brand: input.brand ?? null,
      model: input.model ?? null,
      install_date: input.install_date,
      install_km: input.install_km,
      expected_lifespan_km: input.expected_lifespan_km ?? null,
      status: 'active',
      notes: input.notes ?? null,
    });
  }
}
