import { injectable } from 'tsyringe';

export interface LogoutResult {
  success: boolean;
}

@injectable()
export class LogoutUser {
  // Logout is stateless with JWT - clearing cookie is handled by controller
  // This use case exists for future extension (e.g., token blacklist)
  async execute(): Promise<LogoutResult> {
    return { success: true };
  }
}
