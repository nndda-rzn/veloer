import 'reflect-metadata';
import 'dotenv/config';

function validateEnv(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (!value && required) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value || '';
}

export const env = {
  port: parseInt(validateEnv('PORT', false) || '3001', 10),
  nodeEnv: validateEnv('NODE_ENV', false) || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // Strava
  stravaClientId: validateEnv('STRAVA_CLIENT_ID'),
  stravaClientSecret: validateEnv('STRAVA_CLIENT_SECRET'),
  stravaRedirectUri: validateEnv('STRAVA_REDIRECT_URI'),

  // Supabase
  supabaseUrl: validateEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: validateEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // JWT
  jwtSecret: validateEnv('JWT_SECRET'),
  jwtExpiresIn: validateEnv('JWT_EXPIRES_IN', false) || '7d',

  // Client URL
  clientUrl: validateEnv('CLIENT_URL', false) || 'http://localhost:5173',
} as const;
