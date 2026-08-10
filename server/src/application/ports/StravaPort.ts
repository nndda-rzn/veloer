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
  map?: {
    summary_polyline: string | null;
  };
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
}
