import { inject, injectable } from 'tsyringe';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import type { UserProfile } from '../../../domain/entities/auth/User.js';

@injectable()
export class GetProfile {
  constructor(@inject('UserProfileRepository') private profileRepo: UserProfileRepository) {}

  async execute(userId: string): Promise<UserProfile | null> {
    return this.profileRepo.findByUserId(userId);
  }
}

@injectable()
export class UpdateProfile {
  constructor(@inject('UserProfileRepository') private profileRepo: UserProfileRepository) {}

  async execute(
    userId: string,
    data: Partial<
      Pick<
        UserProfile,
        | 'display_name'
        | 'avatar_url'
        | 'preferred_units'
        | 'default_bike_id'
        | 'timezone'
        | 'currency'
        | 'ftp'
      >
    >,
  ): Promise<UserProfile | null> {
    return this.profileRepo.update(userId, data);
  }
}
