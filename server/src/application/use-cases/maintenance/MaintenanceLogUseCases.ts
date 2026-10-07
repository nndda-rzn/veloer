import { inject, injectable } from 'tsyringe';
import type { MaintenanceLogRepository } from '../../../domain/repositories/maintenance/MaintenanceLogRepository.js';
import type { MaintenanceLog } from '../../../domain/entities/maintenance/MaintenanceLog.js';
import type { BikeRepository } from '../../../domain/repositories/inventory/BikeRepository.js';
import { AddTransaction } from '../finance/TransactionUseCases.js';

/** Thrown when a bike or its record does not exist or belongs to another user. */
export class BikeNotFoundError extends Error {
  constructor() {
    super('BIKE_NOT_FOUND');
  }
}

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
  constructor(
    @inject('MaintenanceLogRepository') private logRepo: MaintenanceLogRepository,
    @inject('BikeRepository') private bikeRepo: BikeRepository,
    @inject(AddTransaction) private addTransaction: AddTransaction,
  ) {}

  async execute(userId: string, input: LogMaintenanceInput): Promise<MaintenanceLog> {
    const bike = await this.bikeRepo.findById(input.bike_id);
    if (!bike || bike.user_id !== userId) throw new BikeNotFoundError();

    const log = await this.logRepo.create({
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

    // Auto-create transaction if cost > 0
    if (input.cost && input.cost > 0) {
      await this.addTransaction.execute(userId, {
        type: 'expense',
        category: 'maintenance',
        amount: input.cost,
        date: input.service_date,
        description: `[Maintenance] ${input.type}: ${input.description}`,
        bike_id: input.bike_id,
        maintenance_log_id: log.id,
      });
    }

    return log;
  }
}

@injectable()
export class GetMaintenanceHistory {
  constructor(
    @inject('MaintenanceLogRepository') private logRepo: MaintenanceLogRepository,
    @inject('BikeRepository') private bikeRepo: BikeRepository,
  ) {}

  async executeByBikeId(bikeId: string, userId: string): Promise<MaintenanceLog[]> {
    const bike = await this.bikeRepo.findById(bikeId);
    if (!bike || bike.user_id !== userId) throw new BikeNotFoundError();
    return this.logRepo.findByBikeId(bikeId);
  }
}

@injectable()
export class DeleteMaintenanceLog {
  constructor(
    @inject('MaintenanceLogRepository') private logRepo: MaintenanceLogRepository,
    @inject('BikeRepository') private bikeRepo: BikeRepository,
  ) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const log = await this.logRepo.findById(id);
    if (!log) return false;
    const bike = await this.bikeRepo.findById(log.bike_id);
    if (!bike || bike.user_id !== userId) return false;

    await this.logRepo.delete(id);
    return true;
  }
}
