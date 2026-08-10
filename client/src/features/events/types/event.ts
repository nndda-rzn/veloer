export interface Event {
  id: string;
  user_id: string;
  name: string;
  type: 'race' | 'gran_fondo' | 'charity' | 'group_ride' | 'tour' | 'other';
  date: string;
  location: string | null;
  distance: number | null;
  registration_fee: number | null;
  status: 'registered' | 'completed' | 'cancelled' | 'dns' | 'dnf';
  result: string | null;
  notes: string | null;
  bike_id: string | null;
  activity_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  name: string;
  type: Event['type'];
  date: string;
  location?: string | null;
  distance?: number | null;
  registration_fee?: number | null;
  status?: Event['status'];
  notes?: string | null;
}
