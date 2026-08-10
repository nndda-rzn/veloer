import { inject, injectable } from 'tsyringe';
import type { ComponentRepository } from '../../../domain/repositories/inventory/BikeRepository.js';
import type { Component } from '../../../domain/entities/inventory/Bike.js';

export interface UpdateComponentInput {
  name?: string;
  category?: Component['category'];
  brand?: string | null;
  model?: string | null;
  expected_lifespan_km?: number | null;
  status?: Component['status'];
  notes?: string | null;
}

@injectable()
export class UpdateComponent {
  constructor(@inject('ComponentRepository') private componentRepo: ComponentRepository) {}

  async execute(id: string, input: UpdateComponentInput): Promise<Component | null> {
    return this.componentRepo.update(id, input);
  }
}

@injectable()
export class DeleteComponent {
  constructor(@inject('ComponentRepository') private componentRepo: ComponentRepository) {}

  async execute(id: string): Promise<boolean> {
    const component = await this.componentRepo.findById(id);
    if (!component) return false;
    await this.componentRepo.delete(id);
    return true;
  }
}

@injectable()
export class GetComponents {
  constructor(@inject('ComponentRepository') private componentRepo: ComponentRepository) {}

  async executeByBikeId(bikeId: string): Promise<Component[]> {
    return this.componentRepo.findByBikeId(bikeId);
  }

  async executeActiveByBikeId(bikeId: string): Promise<Component[]> {
    return this.componentRepo.findActiveByBikeId(bikeId);
  }
}
