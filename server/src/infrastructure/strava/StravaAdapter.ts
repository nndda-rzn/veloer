import { injectable } from 'tsyringe';
import { env } from '../../config/env.js';
import type {
  StravaPort,
  StravaAthlete,
  StravaActivity,
} from '../../application/ports/StravaPort.js';
import type { StravaToken } from '../../domain/entities/auth/User.js';

const STRAVA_AUTH_BASE = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

@injectable()
export class StravaAdapter implements StravaPort {
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: env.stravaClientId,
      redirect_uri: env.stravaRedirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all,profile:read_all',
      approval_prompt: 'auto',
    });
    return `${STRAVA_AUTH_BASE}?${params.toString()}`;
  }

  async exchangeCodeForToken(
    code: string,
  ): Promise<{ token: StravaToken; athlete: StravaAthlete }> {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.stravaClientId,
        client_secret: env.stravaClientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Strava token exchange failed: ${error}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
      token_type: string;
      athlete: StravaAthlete;
    };

    return {
      token: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
      },
      athlete: data.athlete,
    };
  }

  async refreshToken(refreshToken: string): Promise<StravaToken> {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.stravaClientId,
        client_secret: env.stravaClientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Strava token refresh failed: ${error}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
      token_type: string;
    };

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      token_type: data.token_type,
    };
  }

  async getAthlete(accessToken: string): Promise<StravaAthlete> {
    const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Strava getAthlete failed: ${response.status}`);
    }

    return (await response.json()) as StravaAthlete;
  }

  async getActivities(
    accessToken: string,
    options?: { page?: number; perPage?: number; after?: number },
  ): Promise<StravaActivity[]> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.perPage) params.set('per_page', String(options.perPage));
    if (options?.after) params.set('after', String(options.after));

    const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Strava getActivities failed: ${response.status}`);
    }

    return (await response.json()) as StravaActivity[];
  }

  async getActivityById(accessToken: string, id: number): Promise<StravaActivity> {
    const response = await fetch(`${STRAVA_API_BASE}/activities/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Strava getActivityById failed: ${response.status}`);
    }

    return (await response.json()) as StravaActivity;
  }
}
