import type { Request, Response, NextFunction } from 'express';
import type { Application } from 'express';

interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : message,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    ...(err.details ? { details: err.details } : {}),
  });
}

export function configureErrorMiddleware(app: Application): void {
  app.use(errorMiddleware);
}
