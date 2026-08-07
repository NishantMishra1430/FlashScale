// src/server.js
import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: parseInt(env.PORT, 10), host: env.HOST });
    app.log.info(`🚀 FlashScale API Gateway active at http://${env.HOST}:${env.PORT}`);
    
    // Graceful shutdown logic ensures streams and active requests are closed cleanly
    const shutdown = async (signal) => {
      app.log.info(`\nReceived ${signal}, initiating graceful shutdown...`);
      await app.close();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    app.log.error('Gateway initialization failed', err);
    process.exit(1);
  }
}

start();
