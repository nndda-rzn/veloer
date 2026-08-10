import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import { GetProfile, UpdateProfile } from '../../application/use-cases/auth/ProfileUseCases.js';

export class ProfileController {
  async get(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const getProfile = container.resolve(GetProfile);
    const profile = await getProfile.execute(req.user.userId);
    if (!profile) {
      res.status(404).json({ error: 'Not Found', message: 'Profile not found' });
      return;
    }
    res.json(profile);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const updateProfile = container.resolve(UpdateProfile);
    const profile = await updateProfile.execute(req.user.userId, req.body);
    if (!profile) {
      res.status(404).json({ error: 'Not Found', message: 'Profile not found' });
      return;
    }
    res.json(profile);
  }
}
