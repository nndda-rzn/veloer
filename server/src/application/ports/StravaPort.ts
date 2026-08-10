import type { StravaToken } from '../../domain/entities/auth/User.js';

export interface StravaAthlete {
  id: number;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  profile: string | null; // avatar URL
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate: number | null;
  max_heartrate: number | null;
  average_cadence: number | null;
  max_cadence: number | null;
  average_watts: number | null;
  max_watts: number | null;
  weighted_average_watts: number | null;
  kilojoules: number | null;
  device_watts: boolean;
  average_temp: number | null;
  calories: number | null;
  elev_high: number | null;
  elev_low: number | null;
  map?: {
    summary_polyline: string | null;
  };
}

export interface StravaLap {
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

export interface StravaZone {
  sensor_type: 'heartrate' | 'power';
  distribution_buckets: { min: number; max: number; time: number }[];
}

/**
 * Port (interface) for Strava API operations.
 * Defines the contract that infrastructure adapters must implement.
 */
export interface StravaPort {
  // OAuth
  getAuthorizationUrl(): string;
  exchangeCodeForToken(code: string): Promise<{
    token: StravaToken;
    athlete: StravaAthlete;
  }>;
  refreshToken(refreshToken: string): Promise<StravaToken>;

  // API
  getAthlete(accessToken: string): Promise<StravaAthlete>;
  getActivities(
    accessToken: string,
    options?: { page?: number; perPage?: number; after?: number },
  ): Promise<StravaActivity[]>;
  getActivityById(accessToken: string, id: number): Promise<StravaActivity>;
  getActivityLaps(accessToken: string, id: number): Promise<StravaLap[]>;
  getActivityZones(accessToken: string, id: number): Promise<StravaZone[]>;
}
