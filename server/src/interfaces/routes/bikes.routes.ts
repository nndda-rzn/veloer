import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new InventoryController();

// Bikes
router.get('/', authMiddleware, (req, res, next) => {
  void controller.listBikes(req, res).catch(next);
});
router.post('/', authMiddleware, (req, res, next) => {
  void controller.createBike(req, res).catch(next);
});
router.get('/:id', authMiddleware, (req, res, next) => {
  void controller.getBike(req, res).catch(next);
});
router.patch('/:id', authMiddleware, (req, res, next) => {
  void controller.updateBike(req, res).catch(next);
});
router.delete('/:id', authMiddleware, (req, res, next) => {
  void controller.deleteBike(req, res).catch(next);
});

// Components (nested under bikes)
router.get('/:bikeId/components', authMiddleware, (req, res, next) => {
  void controller.listComponents(req, res).catch(next);
});
router.post('/:bikeId/components', authMiddleware, (req, res, next) => {
  void controller.createComponent(req, res).catch(next);
});

export const bikesRoutes = router;
