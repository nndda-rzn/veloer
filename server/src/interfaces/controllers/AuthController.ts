import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import type { StravaPort } from '../../application/ports/StravaPort.js';
import { HandleStravaCallback } from '../../application/use-cases/auth/HandleStravaCallback.js';
import { LogoutUser } from '../../application/use-cases/auth/LogoutUser.js';
import { AUTH_COOKIE_NAME } from '../middleware/auth.middleware.js';
import { env } from '../../config/env.js';

export class AuthController {
  /**
   * GET /api/auth/login
   * Redirect to Strava OAuth consent screen
   */
  login(_req: Request, res: Response) {
    const stravaPort = container.resolve<StravaPort>('StravaPort');
    const authUrl = stravaPort.getAuthorizationUrl();
    res.redirect(authUrl);
  }

  /**
   * GET /api/auth/callback
   * Handle Strava OAuth callback, set JWT cookie, redirect to frontend
   */
  async callback(req: Request, res: Response) {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.redirect(`${env.clientUrl}/login?error=no_code`);
    }

    try {
      const handleCallback = container.resolve(HandleStravaCallback);
      const result = await handleCallback.execute(code);

      // Set JWT in httpOnly cookie
      res.cookie(AUTH_COOKIE_NAME, result.token, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend dashboard
      res.redirect(`${env.clientUrl}/`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${env.clientUrl}/login?error=auth_failed`);
    }
  }

  /**
   * POST /api/auth/logout
   * Clear JWT cookie
   */
  async logout(_req: Request, res: Response) {
    const logoutUseCase = container.resolve(LogoutUser);
    await logoutUseCase.execute();

    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true, message: 'Logged out successfully' });
  }

  /**
   * GET /api/auth/me
   * Get current user info from JWT
   */
  me(req: Request, res: Response): Response {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({
      userId: req.user.userId,
      email: req.user.email,
      stravaId: req.user.stravaId,
    });
  }
}
