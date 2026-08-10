import { inject, injectable } from 'tsyringe';
import type { MaintenanceScheduleRepository } from '../../../domain/repositories/maintenance/MaintenanceLogRepository.js';
import type { MaintenanceSchedule } from '../../../domain/entities/maintenance/MaintenanceLog.js';

export interface AddScheduleInput {
  bike_id: string;
  component_id?: string | null;
  task_name: string;
  interval_km?: number | null;
  interval_days?: number | null;
  last_performed_date?: string | null;
  last_performed_km?: number | null;
  next_due_date?: string | null;
  next_due_km?: number | null;
  is_active?: boolean;
}

@injectable()
export class AddSchedule {
  constructor(
    @inject('MaintenanceScheduleRepository') private scheduleRepo: MaintenanceScheduleRepository,
  ) {}

  async execute(input: AddScheduleInput): Promise<MaintenanceSchedule> {
    return this.scheduleRepo.create({
      bike_id: input.bike_id,
      component_id: input.component_id ?? null,
      task_name: input.task_name,
      interval_km: input.interval_km ?? null,
      interval_days: input.interval_days ?? null,
      last_performed_date: input.last_performed_date ?? null,
      last_performed_km: input.last_performed_km ?? null,
      next_due_date: input.next_due_date ?? null,
      next_due_km: input.next_due_km ?? null,
      is_active: input.is_active ?? true,
    });
  }
}

@injectable()
export class GetSchedules {
  constructor(
    @inject('MaintenanceScheduleRepository') private scheduleRepo: MaintenanceScheduleRepository,
  ) {}

  async executeByBikeId(bikeId: string): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.findByBikeId(bikeId);
  }
}

@injectable()
export class CheckDueSchedules {
  constructor(
    @inject('MaintenanceScheduleRepository') private scheduleRepo: MaintenanceScheduleRepository,
  ) {}

  async execute(userId: string): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.findDueSchedules(userId);
  }
}

@injectable()
export class UpdateSchedule {
  constructor(
    @inject('MaintenanceScheduleRepository') private scheduleRepo: MaintenanceScheduleRepository,
  ) {}

  async execute(
    id: string,
    data: Partial<MaintenanceSchedule>,
  ): Promise<MaintenanceSchedule | null> {
    return this.scheduleRepo.update(id, data);
  }
}

@injectable()
export class DeleteSchedule {
  constructor(
    @inject('MaintenanceScheduleRepository') private scheduleRepo: MaintenanceScheduleRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    const schedule = await this.scheduleRepo.findById(id);
    if (!schedule) return false;
    await this.scheduleRepo.delete(id);
    return true;
  }
}
