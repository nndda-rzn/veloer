import { inject, injectable } from 'tsyringe';
import type { UserRepository } from '../../../domain/repositories/auth/UserRepository.js';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import type { StravaPort } from '../../ports/StravaPort.js';
import type { TokenPort } from '../../ports/TokenPort.js';
import type { User } from '../../../domain/entities/auth/User.js';

export interface HandleStravaCallbackResult {
  token: string;
  user: User;
  isNewUser: boolean;
}

@injectable()
export class HandleStravaCallback {
  constructor(
    @inject('UserRepository') private userRepo: UserRepository,
    @inject('UserProfileRepository') private profileRepo: UserProfileRepository,
    @inject('StravaPort') private stravaPort: StravaPort,
    @inject('TokenPort') private tokenPort: TokenPort,
  ) {}

  async execute(code: string): Promise<HandleStravaCallbackResult> {
    // Exchange code for tokens
    const { token, athlete } = await this.stravaPort.exchangeCodeForToken(code);

    // Find or create user
    let user = await this.userRepo.findByStravaId(athlete.id);
    let isNewUser = false;

    if (!user) {
      user = await this.userRepo.create({
        email: athlete.email || `strava_${athlete.id}@unknown.com`,
        strava_id: athlete.id,
      });
      isNewUser = true;
    }

    // Save Strava tokens
    await this.userRepo.updateStravaTokens(user.id, {
      strava_access_token: token.access_token,
      strava_refresh_token: token.refresh_token,
      strava_token_expires_at: new Date(token.expires_at * 1000).toISOString(),
    });

    // Create profile if new user
    if (isNewUser) {
      await this.profileRepo.create({
        user_id: user.id,
        display_name: [athlete.firstname, athlete.lastname].filter(Boolean).join(' ') || null,
        avatar_url: athlete.profile,
        preferred_units: 'metric',
        default_bike_id: null,
        timezone: 'Asia/Jakarta',
        currency: 'IDR',
        ftp: null,
        lthr: null,
      });
    }

    // Generate JWT
    const jwtToken = await this.tokenPort.generateToken({
      userId: user.id,
      email: user.email,
      stravaId: user.strava_id,
    });

    return { token: jwtToken, user, isNewUser };
  }
}
