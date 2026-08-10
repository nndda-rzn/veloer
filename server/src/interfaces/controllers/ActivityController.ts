import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import { GetActivities } from '../../application/use-cases/activity/GetActivities.js';
import { GetActivityById } from '../../application/use-cases/activity/GetActivityById.js';
import { GetActivityStats } from '../../application/use-cases/activity/GetActivityStats.js';
import { SyncStravaActivities } from '../../application/use-cases/activity/SyncStravaActivities.js';
import {
  GetActivityLaps,
  GetActivityZones,
} from '../../application/use-cases/activity/GetActivityLapsZones.js';
import { ActivityRepository } from '../../domain/repositories/activity/ActivityRepository.js';

export class ActivityController {
  /**
   * GET /api/activities
   * List activities with optional filters
   */
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { limit, offset, bikeId, startDate, endDate } = req.query;

    const getActivities = container.resolve(GetActivities);
    const activities = await getActivities.execute(req.user.userId, {
      limit: limit ? parseInt(String(limit), 10) : undefined,
      offset: offset ? parseInt(String(offset), 10) : undefined,
      bikeId: bikeId ? String(bikeId) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });

    res.json(activities);
  }

  /**
   * GET /api/activities/:id
   * Get single activity detail
   */
  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const getActivityById = container.resolve(GetActivityById);
    const activity = await getActivityById.execute(String(id), req.user.userId);

    if (!activity) {
      res.status(404).json({ error: 'Not Found', message: 'Activity not found' });
      return;
    }

    res.json(activity);
  }

  /**
   * GET /api/activities/stats
   * Get aggregated activity statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;
    const getStats = container.resolve(GetActivityStats);
    const stats = await getStats.execute(
      req.user.userId,
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined,
    );

    res.json(stats);
  }

  /**
   * POST /api/sync
   * Sync activities from Strava
   */
  async sync(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const syncUseCase = container.resolve(SyncStravaActivities);
    const result = await syncUseCase.execute(req.user.userId);

    res.json(result);
  }

  /**
   * PATCH /api/activities/:id/bike
   * Link activity to a bike
   */
  async updateBike(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { bikeId } = req.body;

    // Verify ownership
    const getActivityById = container.resolve(GetActivityById);
    const activity = await getActivityById.execute(String(id), req.user.userId);
    if (!activity) {
      res.status(404).json({ error: 'Not Found', message: 'Activity not found' });
      return;
    }

    const repo = container.resolve<ActivityRepository>('ActivityRepository');
    await repo.updateBikeId(String(id), bikeId || null);

    res.json({ success: true, message: 'Activity bike updated' });
  }

  /**
   * GET /api/activities/:id/laps
   */
  async getLaps(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const getLaps = container.resolve(GetActivityLaps);
    try {
      const laps = await getLaps.execute(String(id), req.user.userId);
      res.json(laps);
    } catch {
      res.status(404).json({ error: 'Not Found', message: 'Activity not found' });
    }
  }

  /**
   * GET /api/activities/:id/zones
   */
  async getZones(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const getZones = container.resolve(GetActivityZones);
    try {
      const zones = await getZones.execute(String(id), req.user.userId);
      res.json(zones);
    } catch {
      res.status(404).json({ error: 'Not Found', message: 'Activity not found' });
    }
  }
}
