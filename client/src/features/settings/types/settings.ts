export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_units: 'metric' | 'imperial';
  default_bike_id: string | null;
  timezone: string;
  currency: string;
  ftp: number | null;
  lthr: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  display_name?: string | null;
  avatar_url?: string | null;
  preferred_units?: 'metric' | 'imperial';
  default_bike_id?: string | null;
  timezone?: string;
  currency?: string;
  ftp?: number | null;
  lthr?: number | null;
}
