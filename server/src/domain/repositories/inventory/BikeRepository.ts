import type { Bike, Component } from '../../entities/inventory/Bike.js';

export interface BikeRepository {
  findByUserId(userId: string): Promise<Bike[]>;
  findById(id: string): Promise<Bike | null>;
  create(data: Omit<Bike, 'id' | 'created_at' | 'updated_at' | 'current_km'>): Promise<Bike>;
  update(id: string, data: Partial<Bike>): Promise<Bike | null>;
  delete(id: string): Promise<void>;
  updateCurrentKm(id: string, additionalKm: number): Promise<void>;
  findMaintenanceAlertCounts(bikeIds: string[]): Promise<Record<string, number>>;
}

export interface ComponentRepository {
  findByBikeId(bikeId: string): Promise<Component[]>;
  findById(id: string): Promise<Component | null>;
  findActiveByBikeId(bikeId: string): Promise<Component[]>;
  create(
    data: Omit<Component, 'id' | 'created_at' | 'updated_at' | 'current_km'>,
  ): Promise<Component>;
  update(id: string, data: Partial<Component>): Promise<Component | null>;
  delete(id: string): Promise<void>;
  updateCurrentKm(bikeId: string, additionalKm: number): Promise<void>;
}
