import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '../../config/env.js';
import { errorMiddleware } from '../../interfaces/middleware/error.middleware.js';
import { notFoundMiddleware } from '../../interfaces/middleware/notFound.middleware.js';
import { authRoutes } from '../../interfaces/routes/auth.routes.js';
import { activityRoutes } from '../../interfaces/routes/activity.routes.js';
import { syncRoutes } from '../../interfaces/routes/sync.routes.js';
import { bikesRoutes } from '../../interfaces/routes/bikes.routes.js';
import { componentsRoutes } from '../../interfaces/routes/components.routes.js';

export function createServer(): Application {
  const app = express();

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cookie parser
  app.use(cookieParser());

  // CORS
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/sync', syncRoutes);
  app.use('/api/bikes', bikesRoutes);
  app.use('/api/components', componentsRoutes);

  // 404 handler
  app.use(notFoundMiddleware);

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
}
