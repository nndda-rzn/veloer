import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import { GetProfile, UpdateProfile } from '../../application/use-cases/auth/ProfileUseCases.js';
import { UploadAvatar } from '../../application/use-cases/auth/UploadAvatar.js';

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

  async uploadAvatar(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Bad Request', message: 'No file uploaded' });
      return;
    }

    const uploadAvatar = container.resolve(UploadAvatar);
    try {
      const result = await uploadAvatar.execute(req.user.userId, {
        buffer: file.buffer,
        mimetype: file.mimetype,
      });
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      if (message === 'INVALID_FILE_TYPE') {
        res
          .status(400)
          .json({ error: 'Bad Request', message: 'Only JPG, PNG, and WebP images are allowed' });
        return;
      }
      if (message === 'NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Profile not found' });
        return;
      }
      // A missing bucket is a setup problem, not a client error. Surface it as
      // such rather than a generic 500 so it is obvious what to fix.
      if (message.includes('Bucket not found')) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Photo storage is not configured yet.',
        });
        return;
      }
      throw err;
    }
  }
}
