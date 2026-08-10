import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { env } from '../../config/env.js';
import type { TokenPort, JwtPayload } from '../../application/ports/TokenPort.js';

@injectable()
export class JwtTokenAdapter implements TokenPort {
  async generateToken(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
