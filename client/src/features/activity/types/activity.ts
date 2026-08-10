export interface Activity {
  id: string;
  user_id: string;
  strava_id: number | null;
  name: string;
  type: string;
  start_date: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number | null; // meters
  avg_speed: number | null; // m/s
  max_speed: number | null; // m/s
  avg_hr: number | null; // bpm
  max_hr: number | null; // bpm
  polyline: string | null;
  bike_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityStats {
  totalDistance: number; // meters
  totalMovingTime: number; // seconds
  totalElevationGain: number; // meters
  count: number;
}

export interface ActivityListFilters {
  limit?: number;
  offset?: number;
  bikeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SyncResult {
  synced: number;
  skipped: number;
  total: number;
}
