import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import {
  GetTrainingPlans,
  GetTrainingPlanById,
  CreateTrainingPlan,
  UpdateTrainingPlan,
  DeleteTrainingPlan,
} from '../../application/use-cases/training/TrainingPlanUseCases.js';
import {
  GetWorkouts,
  CreateWorkout,
  UpdateWorkout,
  DeleteWorkout,
} from '../../application/use-cases/training/WorkoutUseCases.js';
import { GenerateRecommendation } from '../../application/use-cases/training/GenerateRecommendation.js';
import { AutoRescheduleMissed } from '../../application/use-cases/training/AutoRescheduleMissed.js';
import { GetPlanRetrospective } from '../../application/use-cases/training/GetPlanRetrospective.js';

export class TrainingPlanController {
  // ---- Plans ----

  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const useCase = container.resolve(GetTrainingPlans);
    const plans = await useCase.execute(req.user.userId);
    res.json(plans);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const useCase = container.resolve(GetTrainingPlanById);
    const plan = await useCase.execute(String(id), req.user.userId);
    if (!plan) {
      res.status(404).json({ error: 'Not Found', message: 'Training plan not found' });
      return;
    }
    res.json(plan);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const useCase = container.resolve(CreateTrainingPlan);
    const plan = await useCase.execute(req.user.userId, req.body);
    res.status(201).json(plan);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const useCase = container.resolve(UpdateTrainingPlan);
    const plan = await useCase.execute(String(id), req.user.userId, req.body);
    if (!plan) {
      res.status(404).json({ error: 'Not Found', message: 'Training plan not found' });
      return;
    }
    res.json(plan);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const useCase = container.resolve(DeleteTrainingPlan);
    await useCase.execute(String(id), req.user.userId);
    res.status(204).send();
  }

  // ---- Workouts ----

  async listWorkouts(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { planId } = req.params;
    const useCase = container.resolve(GetWorkouts);
    const workouts = await useCase.execute(String(planId), req.user.userId);
    res.json(workouts);
  }

  async createWorkout(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { planId } = req.params;
    const useCase = container.resolve(CreateWorkout);
    const workout = await useCase.execute(req.user.userId, { ...req.body, plan_id: planId });
    res.status(201).json(workout);
  }

  async updateWorkout(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const useCase = container.resolve(UpdateWorkout);
    const workout = await useCase.execute(String(id), req.user.userId, req.body);
    if (!workout) {
      res.status(404).json({ error: 'Not Found', message: 'Workout not found' });
      return;
    }
    res.json(workout);
  }

  async deleteWorkout(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const useCase = container.resolve(DeleteWorkout);
    await useCase.execute(String(id), req.user.userId);
    res.status(204).send();
  }

  // ---- Recommendation ----

  async getRecommendation(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const useCase = container.resolve(GenerateRecommendation);
    const recommendation = await useCase.execute(req.user.userId);
    res.json(recommendation);
  }

  // ---- Auto-reschedule ----

  async rescheduleMissed(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const useCase = container.resolve(AutoRescheduleMissed);
    const result = await useCase.execute(req.user.userId, String(id));
    res.json(result);
  }

  // ---- Retrospective ----

  async getRetrospective(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const useCase = container.resolve(GetPlanRetrospective);
    const result = await useCase.execute(String(id), req.user.userId);
    if (!result) {
      res.status(404).json({ error: 'Not Found', message: 'Training plan not found' });
      return;
    }
    res.json(result);
  }
}
