import type {
  TrainingPlan,
  TrainingPlanCreateData,
  TrainingPlanWorkoutCounts,
} from '../../entities/training/TrainingPlan.js';
import type {
  TrainingWorkout,
  TrainingWorkoutCreateData,
} from '../../entities/training/TrainingWorkout.js';

export interface TrainingPlanRepository {
  // Plans
  findByUser(userId: string): Promise<TrainingPlan[]>;
  findById(id: string, userId: string): Promise<TrainingPlan | null>;
  create(data: TrainingPlanCreateData): Promise<TrainingPlan>;
  update(id: string, userId: string, data: Partial<TrainingPlan>): Promise<TrainingPlan | null>;
  delete(id: string, userId: string): Promise<void>;

  /** Aggregate workout totals per plan for a user (for list progress bars). */
  getWorkoutCountsByUser(userId: string): Promise<TrainingPlanWorkoutCounts[]>;

  // Workouts
  findWorkouts(planId: string, userId: string): Promise<TrainingWorkout[]>;
  findWorkoutById(id: string, userId: string): Promise<TrainingWorkout | null>;
  findWorkoutsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TrainingWorkout[]>;
  createWorkout(data: TrainingWorkoutCreateData): Promise<TrainingWorkout>;
  updateWorkout(
    id: string,
    userId: string,
    data: Partial<TrainingWorkout>,
  ): Promise<TrainingWorkout | null>;
  deleteWorkout(id: string, userId: string): Promise<void>;
}
