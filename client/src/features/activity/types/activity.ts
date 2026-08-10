export interface Activity {
  id: string;
  user_id: string;
  strava_id: number | null;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number | null;
  avg_speed: number | null;
  max_speed: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  polyline: string | null;
  bike_id: string | null;
  avg_cadence: number | null;
  max_cadence: number | null;
  avg_watts: number | null;
  max_watts: number | null;
  weighted_avg_watts: number | null;
  kilojoules: number | null;
  device_watts: boolean;
  avg_temp: number | null;
  calories: number | null;
  elev_high: number | null;
  elev_low: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLap {
  id: number;
  lap_index: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  average_speed: number;
  max_speed: number;
  average_heartrate: number | null;
  max_heartrate: number | null;
  average_cadence: number | null;
  average_watts: number | null;
  lap_type: string | null;
}

export interface ActivityZone {
  sensor_type: 'heartrate' | 'power';
  distribution_buckets: { min: number; max: number; time: number }[];
}

export interface ActivityStats {
  totalDistance: number;
  totalMovingTime: number;
  totalElevationGain: number;
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
  goalsUpdated: number;
}
