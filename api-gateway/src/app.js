// src/app.js
import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from './config/env.js';

import jwtPlugin from './plugins/jwt.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import proxyRoutes from './routes/proxy.js';

export async function buildApp() {
  // Fastify utilizes Pino internally for high-performance JSON structured logging
  const app = fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    }
  });

  // 1. Core Security Plugins
  await app.register(cors, { origin: true }); // Restrict origin for production
  await app.register(helmet, { global: true });

  // 2. Auth & Anti-DDoS Plugins
  await app.register(rateLimitPlugin);
  await app.register(jwtPlugin);

  // 3. Infrastructure Health Check
  app.get('/health', async () => ({ 
    status: 'operational', 
    service: 'api-gateway',
    timestamp: new Date().toISOString() 
  }));

  // 4. Register Microservice Proxy Routes
  await app.register(proxyRoutes);

  return app;
}
