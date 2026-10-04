import { Router } from 'express';
import { GoalController } from '../controllers/GoalController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new GoalController();

router.get('/', authMiddleware, (req, res, next) => {
  void controller.list(req, res).catch(next);
});
router.post('/', authMiddleware, (req, res, next) => {
  void controller.create(req, res).catch(next);
});
router.get('/:id', authMiddleware, (req, res, next) => {
  void controller.getById(req, res).catch(next);
});
router.patch('/:id', authMiddleware, (req, res, next) => {
  void controller.update(req, res).catch(next);
});
router.post('/:id/recalculate', authMiddleware, (req, res, next) => {
  void controller.recalculate(req, res).catch(next);
});
router.patch('/:id/progress', authMiddleware, (req, res, next) => {
  void controller.adjustProgress(req, res).catch(next);
});
router.delete('/:id', authMiddleware, (req, res, next) => {
  void controller.delete(req, res).catch(next);
});

export const goalRoutes = router;
