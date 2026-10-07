export interface Bike {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  type: 'road' | 'mtb' | 'gravel' | 'hybrid' | 'folding' | 'other';
  purchase_date: string | null;
  purchase_price: number | null; // IDR
  current_km: number;
  status: 'active' | 'retired' | 'sold';
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  maintenance_alert_count?: number;
}

export interface Component {
  id: string;
  bike_id: string;
  name: string;
  category: 'drivetrain' | 'braking' | 'wheel' | 'cockpit' | 'frame' | 'other';
  brand: string | null;
  model: string | null;
  install_date: string;
  install_km: number;
  expected_lifespan_km: number | null;
  current_km: number;
  status: 'active' | 'replaced' | 'failed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WearAlert {
  component_id: string;
  bike_id: string;
  bike_name: string;
  component_name: string;
  category: Component['category'];
  wear_km: number;
  expected_lifespan_km: number | null;
  wear_percent: number | null;
  remaining_km: number | null;
  level: 'critical' | 'warning' | 'info';
  estimated_due_date: string | null;
}

export interface BikeFormData {
  name: string;
  brand?: string | null;
  model?: string | null;
  type: Bike['type'];
  purchase_date?: string | null;
  purchase_price?: number | null;
  status?: Bike['status'];
  photo_url?: string | null;
  notes?: string | null;
}

export interface ComponentFormData {
  bike_id: string;
  name: string;
  category: Component['category'];
  brand?: string | null;
  model?: string | null;
  install_date: string;
  /** Odometer at install. Omit to default to the bike's current km. */
  install_km?: number | null;
  expected_lifespan_km?: number | null;
  status?: Component['status'];
  notes?: string | null;
}
