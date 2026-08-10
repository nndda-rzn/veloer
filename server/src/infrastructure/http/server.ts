import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '../../config/env.js';
import { errorMiddleware } from '../../interfaces/middleware/error.middleware.js';
import { notFoundMiddleware } from '../../interfaces/middleware/notFound.middleware.js';

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

  // API routes will be registered here
  // app.use('/api/auth', authRoutes);
  // app.use('/api/activities', activitiesRoutes);
  // ...

  // 404 handler
  app.use(notFoundMiddleware);

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
}
