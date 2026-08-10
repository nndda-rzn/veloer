import type { User, StravaToken } from '../../entities/auth/User.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByStravaId(stravaId: number): Promise<User | null>;
  create(data: { email: string; strava_id?: number }): Promise<User>;
  updateStravaTokens(
    id: string,
    tokens: {
      strava_access_token: string;
      strava_refresh_token: string;
      strava_token_expires_at: string;
    },
  ): Promise<void>;
  getStravaTokens(id: string): Promise<StravaToken | null>;
}
