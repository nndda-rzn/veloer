import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new InventoryController();

// Component CRUD by component id
router.patch('/:id', authMiddleware, (req, res, next) => {
  void controller.updateComponent(req, res).catch(next);
});
router.delete('/:id', authMiddleware, (req, res, next) => {
  void controller.deleteComponent(req, res).catch(next);
});

export const componentsRoutes = router;
