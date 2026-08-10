import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Public routes
router.get('/login', authController.login.bind(authController));
router.get('/callback', authController.callback.bind(authController));

// Protected routes
router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.get('/me', authMiddleware, authController.me.bind(authController));

export const authRoutes = router;
