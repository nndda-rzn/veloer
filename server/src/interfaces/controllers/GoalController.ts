import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import {
  CreateGoal,
  UpdateGoal,
  DeleteGoal,
  GetGoals,
  GetGoalStatus,
} from '../../application/use-cases/goals/GoalUseCases.js';

export class GoalController {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { active } = req.query;
    const getGoals = container.resolve(GetGoals);
    const goals =
      active === 'true'
        ? await getGoals.executeActive(req.user.userId)
        : await getGoals.execute(req.user.userId);
    res.json(goals);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const getGoalStatus = container.resolve(GetGoalStatus);
    const goal = await getGoalStatus.execute(String(id));
    if (!goal || goal.user_id !== req.user.userId) {
      res.status(404).json({ error: 'Not Found', message: 'Goal not found' });
      return;
    }
    res.json(goal);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const createGoal = container.resolve(CreateGoal);
    const goal = await createGoal.execute(req.user.userId, req.body);
    res.status(201).json(goal);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const updateGoal = container.resolve(UpdateGoal);
    const goal = await updateGoal.execute(String(id), req.body);
    if (!goal) {
      res.status(404).json({ error: 'Not Found', message: 'Goal not found' });
      return;
    }
    res.json(goal);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteGoal = container.resolve(DeleteGoal);
    const deleted = await deleteGoal.execute(String(id));
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Goal not found' });
      return;
    }
    res.status(204).send();
  }
}
