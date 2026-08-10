import { inject, injectable } from 'tsyringe';
import type { MaintenanceLogRepository } from '../../../domain/repositories/maintenance/MaintenanceLogRepository.js';
import type { MaintenanceLog } from '../../../domain/entities/maintenance/MaintenanceLog.js';

export interface LogMaintenanceInput {
  bike_id: string;
  component_id?: string | null;
  service_date: string;
  service_km: number;
  type: MaintenanceLog['type'];
  description: string;
  cost?: number | null;
  performed_by: MaintenanceLog['performed_by'];
  shop_name?: string | null;
  next_service_km?: number | null;
  next_service_date?: string | null;
}

@injectable()
export class LogMaintenance {
  constructor(@inject('MaintenanceLogRepository') private logRepo: MaintenanceLogRepository) {}

  async execute(input: LogMaintenanceInput): Promise<MaintenanceLog> {
    return this.logRepo.create({
      bike_id: input.bike_id,
      component_id: input.component_id ?? null,
      service_date: input.service_date,
      service_km: input.service_km,
      type: input.type,
      description: input.description,
      cost: input.cost ?? null,
      performed_by: input.performed_by,
      shop_name: input.shop_name ?? null,
      next_service_km: input.next_service_km ?? null,
      next_service_date: input.next_service_date ?? null,
    });
  }
}

@injectable()
export class GetMaintenanceHistory {
  constructor(@inject('MaintenanceLogRepository') private logRepo: MaintenanceLogRepository) {}

  async executeByBikeId(bikeId: string): Promise<MaintenanceLog[]> {
    return this.logRepo.findByBikeId(bikeId);
  }
}

@injectable()
export class DeleteMaintenanceLog {
  constructor(@inject('MaintenanceLogRepository') private logRepo: MaintenanceLogRepository) {}

  async execute(id: string): Promise<boolean> {
    const log = await this.logRepo.findById(id);
    if (!log) return false;
    await this.logRepo.delete(id);
    return true;
  }
}
