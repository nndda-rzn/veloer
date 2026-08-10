export interface JwtPayload {
  userId: string;
  email: string;
  stravaId: number | null;
}

/**
 * Port (interface) for JWT token management.
 * Defines the contract for generating and verifying JWT tokens.
 */
export interface TokenPort {
  generateToken(payload: JwtPayload): Promise<string>;
  verifyToken(token: string): Promise<JwtPayload | null>;
}
