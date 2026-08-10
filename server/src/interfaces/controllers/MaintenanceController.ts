import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import {
  LogMaintenance,
  GetMaintenanceHistory,
  DeleteMaintenanceLog,
} from '../../application/use-cases/maintenance/MaintenanceLogUseCases.js';
import {
  AddSchedule,
  GetSchedules,
  CheckDueSchedules,
  UpdateSchedule,
  DeleteSchedule,
} from '../../application/use-cases/maintenance/MaintenanceScheduleUseCases.js';

export class MaintenanceController {
  // --- LOGS ---

  async listLogs(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { bikeId } = req.params;
    const getHistory = container.resolve(GetMaintenanceHistory);
    const logs = await getHistory.executeByBikeId(String(bikeId));
    res.json(logs);
  }

  async createLog(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const logMaintenance = container.resolve(LogMaintenance);
    const log = await logMaintenance.execute(req.user.userId, req.body);
    res.status(201).json(log);
  }

  async deleteLog(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteLog = container.resolve(DeleteMaintenanceLog);
    const deleted = await deleteLog.execute(String(id));
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Maintenance log not found' });
      return;
    }
    res.status(204).send();
  }

  // --- SCHEDULES ---

  async listSchedules(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { bikeId } = req.params;
    const getSchedules = container.resolve(GetSchedules);
    const schedules = await getSchedules.executeByBikeId(String(bikeId));
    res.json(schedules);
  }

  async createSchedule(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const addSchedule = container.resolve(AddSchedule);
    const schedule = await addSchedule.execute(req.body);
    res.status(201).json(schedule);
  }

  async updateSchedule(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const updateScheduleUseCase = container.resolve(UpdateSchedule);
    const schedule = await updateScheduleUseCase.execute(String(id), req.body);
    if (!schedule) {
      res.status(404).json({ error: 'Not Found', message: 'Schedule not found' });
      return;
    }
    res.json(schedule);
  }

  async deleteSchedule(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteSchedule = container.resolve(DeleteSchedule);
    const deleted = await deleteSchedule.execute(String(id));
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Schedule not found' });
      return;
    }
    res.status(204).send();
  }

  // --- DUE ---

  async getDueSchedules(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const checkDue = container.resolve(CheckDueSchedules);
    const due = await checkDue.execute(req.user.userId);
    res.json(due);
  }
}
