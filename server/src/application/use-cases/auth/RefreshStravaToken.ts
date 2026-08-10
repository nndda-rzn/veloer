import { inject, injectable } from 'tsyringe';
import type { UserRepository } from '../../../domain/repositories/auth/UserRepository.js';
import type { StravaPort } from '../../ports/StravaPort.js';
import type { StravaToken } from '../../../domain/entities/auth/User.js';

@injectable()
export class RefreshStravaToken {
  constructor(
    @inject('UserRepository') private userRepo: UserRepository,
    @inject('StravaPort') private stravaPort: StravaPort,
  ) {}

  async execute(userId: string): Promise<StravaToken> {
    const tokens = await this.userRepo.getStravaTokens(userId);
    if (!tokens) {
      throw new Error('No Strava tokens found for user');
    }

    // Check if token is expired (with 5 min buffer)
    const now = Math.floor(Date.now() / 1000);
    const isExpired = tokens.expires_at - now < 300;

    if (isExpired) {
      const newToken = await this.stravaPort.refreshToken(tokens.refresh_token);

      await this.userRepo.updateStravaTokens(userId, {
        strava_access_token: newToken.access_token,
        strava_refresh_token: newToken.refresh_token,
        strava_token_expires_at: new Date(newToken.expires_at * 1000).toISOString(),
      });

      return newToken;
    }

    return tokens;
  }
}
