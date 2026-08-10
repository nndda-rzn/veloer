export interface User {
  id: string;
  email: string;
  strava_id: number | null;
  strava_access_token: string | null;
  strava_refresh_token: string | null;
  strava_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StravaToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix timestamp
  token_type: string;
}

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_units: 'metric' | 'imperial';
  default_bike_id: string | null;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}
