// src/server.js
import { app } from "./app.js";
import { env } from "./config/env.js";
import { initDb, pool } from "./config/db.js";
import { connectRabbitMQ, closeRabbitMQ } from "./config/rabbitmq.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  try {
    // 1. Initialize PostgreSQL & RabbitMQ
    await initDb();
    await connectRabbitMQ();

    // 2. Start Express Server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Order Service running on port ${env.PORT}`);
    });

    // 3. Graceful Shutdown handlers
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        await closeRabbitMQ();
        logger.info("RabbitMQ connection closed.");
        await pool.end();
        logger.info("PostgreSQL connection closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error("Failed to start Order Service", { error: error.message });
    process.exit(1);
  }
};

startServer();
