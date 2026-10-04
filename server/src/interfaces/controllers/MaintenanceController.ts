import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import {
  LogMaintenance,
  GetMaintenanceHistory,
  DeleteMaintenanceLog,
  BikeNotFoundError,
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
    try {
      const logs = await getHistory.executeByBikeId(String(bikeId), req.user.userId);
      res.json(logs);
    } catch (err) {
      if (err instanceof BikeNotFoundError) {
        res.status(404).json({ error: 'Not Found', message: 'Bike not found' });
        return;
      }
      throw err;
    }
  }

  async createLog(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const logMaintenance = container.resolve(LogMaintenance);
    try {
      const log = await logMaintenance.execute(req.user.userId, req.body);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof BikeNotFoundError) {
        res.status(404).json({ error: 'Not Found', message: 'Bike not found' });
        return;
      }
      throw err;
    }
  }

  async deleteLog(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteLog = container.resolve(DeleteMaintenanceLog);
    const deleted = await deleteLog.execute(String(id), req.user.userId);
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
    try {
      const schedules = await getSchedules.executeByBikeId(String(bikeId), req.user.userId);
      res.json(schedules);
    } catch (err) {
      if (err instanceof BikeNotFoundError) {
        res.status(404).json({ error: 'Not Found', message: 'Bike not found' });
        return;
      }
      throw err;
    }
  }

  async createSchedule(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const addSchedule = container.resolve(AddSchedule);
    try {
      const schedule = await addSchedule.execute(req.user.userId, req.body);
      res.status(201).json(schedule);
    } catch (err) {
      if (err instanceof BikeNotFoundError) {
        res.status(404).json({ error: 'Not Found', message: 'Bike not found' });
        return;
      }
      throw err;
    }
  }

  async updateSchedule(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const updateScheduleUseCase = container.resolve(UpdateSchedule);
    const schedule = await updateScheduleUseCase.execute(String(id), req.user.userId, req.body);
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
    const deleted = await deleteSchedule.execute(String(id), req.user.userId);
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
