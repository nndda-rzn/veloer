import { inject, injectable } from 'tsyringe';
import type {
  BikeRepository,
  ComponentRepository,
} from '../../../domain/repositories/inventory/BikeRepository.js';
import type { Bike, Component } from '../../../domain/entities/inventory/Bike.js';

/** Thrown when a component does not exist or belongs to another user. */
export class ComponentNotFoundError extends Error {
  constructor() {
    super('COMPONENT_NOT_FOUND');
  }
}

export interface UpdateComponentInput {
  name?: string;
  category?: Component['category'];
  brand?: string | null;
  model?: string | null;
  install_date?: string;
  install_km?: number;
  expected_lifespan_km?: number | null;
  status?: Component['status'];
  notes?: string | null;
}

@injectable()
export class UpdateComponent {
  constructor(
    @inject('ComponentRepository') private componentRepo: ComponentRepository,
    @inject('BikeRepository') private bikeRepo: BikeRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    input: UpdateComponentInput,
  ): Promise<Component | null> {
    const component = await this.componentRepo.findById(id);
    if (!component) return null;
    if (!(await this.ownsBike(component.bike_id, userId))) return null;
    return this.componentRepo.update(id, input);
  }

  private async ownsBike(bikeId: string, userId: string): Promise<boolean> {
    const bike = await this.bikeRepo.findById(bikeId);
    return !!bike && bike.user_id === userId;
  }
}

@injectable()
export class DeleteComponent {
  constructor(
    @inject('ComponentRepository') private componentRepo: ComponentRepository,
    @inject('BikeRepository') private bikeRepo: BikeRepository,
  ) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const component = await this.componentRepo.findById(id);
    if (!component) return false;
    const bike = await this.bikeRepo.findById(component.bike_id);
    if (!bike || bike.user_id !== userId) return false;

    await this.componentRepo.delete(id);
    return true;
  }
}

@injectable()
export class GetComponents {
  constructor(
    @inject('ComponentRepository') private componentRepo: ComponentRepository,
    @inject('BikeRepository') private bikeRepo: BikeRepository,
  ) {}

  async executeByBikeId(bikeId: string, userId: string): Promise<Component[]> {
    const bike = await this.bikeRepo.findById(bikeId);
    if (!bike || bike.user_id !== userId) throw new ComponentNotFoundError();
    return this.componentRepo.findByBikeId(bikeId);
  }

  async executeActiveByBikeId(bikeId: string, userId: string): Promise<Component[]> {
    const bike = await this.bikeRepo.findById(bikeId);
    if (!bike || bike.user_id !== userId) throw new ComponentNotFoundError();
    return this.componentRepo.findActiveByBikeId(bikeId);
  }
}

export interface ReplaceComponentInput {
  /** Fields that differ from the old component. Anything omitted is copied. */
  name?: string;
  brand?: string | null;
  model?: string | null;
  install_date?: string;
  install_km?: number;
  expected_lifespan_km?: number | null;
  notes?: string | null;
}

export interface ReplaceComponentResult {
  replaced: Component;
  replacement: Component;
}

/**
 * Retire a worn component and install its successor in one step.
 *
 * The old component is marked `replaced`; the new one copies the old spec and
 * starts fresh at the bike's current odometer (zero wear).
 */
@injectable()
export class ReplaceComponent {
  constructor(
    @inject('ComponentRepository') private componentRepo: ComponentRepository,
    @inject('BikeRepository') private bikeRepo: BikeRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    input: ReplaceComponentInput = {},
  ): Promise<ReplaceComponentResult> {
    const old = await this.componentRepo.findById(id);
    if (!old) throw new ComponentNotFoundError();

    const bike = await this.bikeRepo.findById(old.bike_id);
    if (!bike || bike.user_id !== userId) throw new ComponentNotFoundError();

    const replaced = await this.componentRepo.update(id, { status: 'replaced' });
    if (!replaced) throw new ComponentNotFoundError();

    const replacement = await this.componentRepo.create({
      bike_id: old.bike_id,
      name: input.name ?? old.name,
      category: old.category,
      brand: input.brand !== undefined ? input.brand : old.brand,
      model: input.model !== undefined ? input.model : old.model,
      install_date: input.install_date ?? new Date().toISOString().slice(0, 10),
      install_km: input.install_km ?? bike.current_km,
      expected_lifespan_km:
        input.expected_lifespan_km !== undefined
          ? input.expected_lifespan_km
          : old.expected_lifespan_km,
      current_km: bike.current_km,
      status: 'active',
      notes: input.notes !== undefined ? input.notes : old.notes,
    });

    return { replaced, replacement };
  }
}

export type { Bike };
