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
