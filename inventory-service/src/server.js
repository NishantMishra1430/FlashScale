// src/server.js
import { app } from "./app.js";
import { env } from "./config/env.js";
import { initDb, pool } from "./config/db.js";
import { redisClient } from "./config/redis.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  try {
    await initDb();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Inventory Service running on port ${env.PORT}`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        await pool.end();
        logger.info("PostgreSQL connection closed.");
        redisClient.disconnect();
        logger.info("Redis connection closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error("Failed to start Inventory Service", { error: error.message });
    process.exit(1);
  }
};

startServer();
