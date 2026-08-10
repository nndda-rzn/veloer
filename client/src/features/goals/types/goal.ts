export interface Goal {
  id: string;
  user_id: string;
  type: 'distance' | 'time' | 'elevation' | 'activities_count';
  target_value: number;
  current_value: number;
  unit: string;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  start_date: string;
  end_date: string;
  title: string | null;
  description: string | null;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface GoalFormData {
  type: Goal['type'];
  target_value: number;
  unit: string;
  period: Goal['period'];
  start_date: string;
  end_date: string;
  title?: string | null;
  description?: string | null;
}
