// tsyringe reads decorator metadata, which requires the reflect polyfill to be
// loaded before any decorated module. Unit tests import use cases directly, so
// the polyfill is loaded here (the app entry point loads it in production).
import 'reflect-metadata';

// Some modules validate their environment at import time (config/env.ts calls
// process.exit when a required variable is missing). A unit test that imports a
// controller or router therefore needs the variables to exist. These are
// placeholders: no test opens a real connection, and the values are never used
// to reach a service. Setting them here keeps the test suite runnable on a
// machine without a .env (such as CI) without weakening any assertion.
const TEST_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  STRAVA_CLIENT_ID: 'test-client-id',
  STRAVA_CLIENT_SECRET: 'test-client-secret',
  STRAVA_REDIRECT_URI: 'http://localhost:3001/api/auth/callback',
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  JWT_SECRET: 'test-jwt-secret',
};

for (const [key, value] of Object.entries(TEST_ENV)) {
  // Do not overwrite a real value when one is present (local runs with a .env).
  if (!process.env[key]) process.env[key] = value;
}
