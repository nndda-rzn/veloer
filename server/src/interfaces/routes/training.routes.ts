import { Router } from 'express';
import { TrainingPlanController } from '../controllers/TrainingPlanController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new TrainingPlanController();

// Recommendations
router.get('/recommendations', authMiddleware, (req, res, next) => {
  void controller.getRecommendation(req, res).catch(next);
});

// Load history (CTL/ATL/TSS per day, 42 days)
router.get('/load-history', authMiddleware, (req, res, next) => {
  void controller.getLoadHistory(req, res).catch(next);
});

// From template
router.post('/from-template', authMiddleware, (req, res, next) => {
  void controller.createFromTemplate(req, res).catch(next);
});

// Plans
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
router.delete('/:id', authMiddleware, (req, res, next) => {
  void controller.delete(req, res).catch(next);
});

// Workouts (nested under plans)
router.get('/:planId/workouts', authMiddleware, (req, res, next) => {
  void controller.listWorkouts(req, res).catch(next);
});
router.post('/:planId/workouts', authMiddleware, (req, res, next) => {
  void controller.createWorkout(req, res).catch(next);
});
router.patch('/:planId/workouts/:id', authMiddleware, (req, res, next) => {
  void controller.updateWorkout(req, res).catch(next);
});
router.delete('/:planId/workouts/:id', authMiddleware, (req, res, next) => {
  void controller.deleteWorkout(req, res).catch(next);
});
router.post('/:id/reschedule-missed', authMiddleware, (req, res, next) => {
  void controller.rescheduleMissed(req, res).catch(next);
});
router.get('/:id/retrospective', authMiddleware, (req, res, next) => {
  void controller.getRetrospective(req, res).catch(next);
});

export const trainingPlanRoutes = router;
