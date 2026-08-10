import type {
  MaintenanceLog,
  MaintenanceSchedule,
} from '../../entities/maintenance/MaintenanceLog.js';

export interface MaintenanceLogRepository {
  findByBikeId(bikeId: string): Promise<MaintenanceLog[]>;
  findById(id: string): Promise<MaintenanceLog | null>;
  create(data: Omit<MaintenanceLog, 'id' | 'created_at'>): Promise<MaintenanceLog>;
  update(id: string, data: Partial<MaintenanceLog>): Promise<MaintenanceLog | null>;
  delete(id: string): Promise<void>;
}

export interface MaintenanceScheduleRepository {
  findByBikeId(bikeId: string): Promise<MaintenanceSchedule[]>;
  findDueSchedules(
    userId: string,
    options?: { currentKm?: number; date?: string },
  ): Promise<MaintenanceSchedule[]>;
  findById(id: string): Promise<MaintenanceSchedule | null>;
  create(
    data: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<MaintenanceSchedule>;
  update(id: string, data: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule | null>;
  delete(id: string): Promise<void>;
}
