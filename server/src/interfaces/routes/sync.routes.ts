import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const activityController = new ActivityController();

// Sync routes require authentication
router.use(authMiddleware);

router.post('/', activityController.sync.bind(activityController));

export const syncRoutes = router;
