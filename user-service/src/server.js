// src/server.js
import { app } from "./app.js";
import { env } from "./config/env.js";
import { initDb, pool } from "./config/db.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  try {
    // 1. Initialize PostgreSQL Connection & Tables
    await initDb();

    // 2. Start Express Server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 User Service running on port ${env.PORT}`);
    });

    // 3. Graceful Shutdown handlers
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        await pool.end(); // Close DB pool
        logger.info("PostgreSQL pool closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error("Failed to start User Service", { error: error.message });
    process.exit(1);
  }
};

startServer();
