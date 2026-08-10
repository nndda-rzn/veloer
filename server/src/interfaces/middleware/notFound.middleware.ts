import type { Request, Response, NextFunction } from 'express';
import type { Application } from 'express';

export function notFoundMiddleware(_req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
}

export function configureNotFoundMiddleware(app: Application): void {
  app.use(notFoundMiddleware);
}
