import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadPhoto } from '../middleware/upload.middleware.js';

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

// Photo upload
router.post('/:id/photo', authMiddleware, (req, res, next) => {
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
    void controller.uploadBikePhoto(req, res).catch(next);
  });
});

// Components (nested under bikes)
router.get('/:bikeId/components', authMiddleware, (req, res, next) => {
  void controller.listComponents(req, res).catch(next);
});
router.post('/:bikeId/components', authMiddleware, (req, res, next) => {
  void controller.createComponent(req, res).catch(next);
});

export const bikesRoutes = router;
