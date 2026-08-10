import { Router } from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new MaintenanceController();

// Maintenance logs (nested under bikes)
router.get('/:bikeId/logs', authMiddleware, (req, res, next) => {
  void controller.listLogs(req, res).catch(next);
});
router.post('/:bikeId/logs', authMiddleware, (req, res, next) => {
  void controller.createLog(req, res).catch(next);
});

// Maintenance schedules (nested under bikes)
router.get('/:bikeId/schedules', authMiddleware, (req, res, next) => {
  void controller.listSchedules(req, res).catch(next);
});
router.post('/:bikeId/schedules', authMiddleware, (req, res, next) => {
  void controller.createSchedule(req, res).catch(next);
});

// Due schedules (user-level)
router.get('/due', authMiddleware, (req, res, next) => {
  void controller.getDueSchedules(req, res).catch(next);
});

export const maintenanceRoutes = router;
