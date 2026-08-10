import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const activityController = new ActivityController();

// All activity routes require authentication
router.use(authMiddleware);

router.get('/', activityController.list.bind(activityController));
router.get('/stats', activityController.getStats.bind(activityController));
router.get('/:id', activityController.getById.bind(activityController));
router.get('/:id/laps', activityController.getLaps.bind(activityController));
router.get('/:id/zones', activityController.getZones.bind(activityController));
router.patch('/:id/bike', activityController.updateBike.bind(activityController));

export const activityRoutes = router;
