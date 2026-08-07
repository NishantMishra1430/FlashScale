// src/server.js
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  try {
    // 1. Initialize MongoDB Connection
    await connectDB();

    // 2. Start Express Server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Product Catalog Service running on port ${env.PORT}`);
    });

    // 3. Graceful Shutdown handlers
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        await mongoose.connection.close(false);
        logger.info("MongoDB connection closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error("Failed to start Product Service", { error: error.message });
    process.exit(1);
  }
};

startServer();
