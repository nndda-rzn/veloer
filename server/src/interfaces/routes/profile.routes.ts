import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadPhoto } from '../middleware/upload.middleware.js';

const router = Router();
const controller = new ProfileController();

router.get('/', authMiddleware, (req, res, next) => {
  void controller.get(req, res).catch(next);
});
router.patch('/', authMiddleware, (req, res, next) => {
  void controller.update(req, res).catch(next);
});

// Avatar upload (multipart/form-data, field 'photo')
router.post('/avatar', authMiddleware, (req, res, next) => {
  uploadPhoto(req, res, (err) => {
    if (err) {
      const message =
        err.message === 'INVALID_FILE_TYPE'
          ? 'Only JPG, PNG, and WebP images are allowed'
          : err.message === 'File too large'
            ? 'File too large (max 5 MB)'
            : err.message;
      res.status(400).json({ error: 'Bad Request', message });
      return;
    }
    void controller.uploadAvatar(req, res).catch(next);
  });
});

export const profileRoutes = router;
