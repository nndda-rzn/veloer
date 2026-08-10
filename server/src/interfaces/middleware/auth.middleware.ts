import type { Request, Response, NextFunction } from 'express';
import { container } from '../../config/dependencies.js';
import type { TokenPort } from '../../application/ports/TokenPort.js';
import type { JwtPayload } from '../../application/ports/TokenPort.js';

// Extend Express Request to include user
declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const AUTH_COOKIE_NAME = 'veloer_token';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
      return;
    }

    const tokenPort = container.resolve<TokenPort>('TokenPort');
    const payload = await tokenPort.verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
  }
}

export { AUTH_COOKIE_NAME };
