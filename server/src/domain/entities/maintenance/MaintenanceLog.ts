export interface MaintenanceLog {
  id: string;
  bike_id: string;
  component_id: string | null;
  service_date: string;
  service_km: number;
  type: 'routine' | 'repair' | 'replacement' | 'cleaning' | 'tuning';
  description: string;
  cost: number | null; // IDR
  performed_by: 'self' | 'shop';
  shop_name: string | null;
  next_service_km: number | null;
  next_service_date: string | null;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  bike_id: string;
  component_id: string | null;
  task_name: string;
  interval_km: number | null;
  interval_days: number | null;
  last_performed_date: string | null;
  last_performed_km: number | null;
  next_due_date: string | null;
  next_due_km: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
