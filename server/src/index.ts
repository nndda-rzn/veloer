import 'reflect-metadata';
import './config/dependencies.js';
import { createServer } from './infrastructure/http/server.js';
import { env } from './config/env.js';

const app = createServer();

app.listen(env.port, () => {
  console.log(`🚴 Veloer server running on http://localhost:${env.port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
});
