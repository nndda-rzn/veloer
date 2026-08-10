export type TrainingPlanGoalType = 'ftp' | 'endurance' | 'century' | 'gran_fondo' | 'custom';

export type TrainingPlanStatus = 'active' | 'completed' | 'archived';

export interface TrainingPlan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: TrainingPlanGoalType;
  start_date: string; // ISO date
  end_date: string; // ISO date
  ftp_baseline: number;
  status: TrainingPlanStatus;
  created_at: string;
  updated_at: string;
}

export type TrainingPlanCreateData = Omit<
  TrainingPlan,
  'id' | 'created_at' | 'updated_at' | 'status'
> & {
  status?: TrainingPlanStatus;
};
