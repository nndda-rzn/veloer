import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new ProfileController();

router.get('/', authMiddleware, (req, res, next) => {
  void controller.get(req, res).catch(next);
});
router.patch('/', authMiddleware, (req, res, next) => {
  void controller.update(req, res).catch(next);
});

export const profileRoutes = router;
