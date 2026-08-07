// src/server.js
import { startConsumer, closeConnection } from "./rabbitmq/consumer.js";
import { logger } from "./utils/logger.js";

const startWorker = async () => {
  logger.info("🚀 Starting Notification Service Worker...");

  // Start listening to the RabbitMQ queue
  await startConsumer();

  // Graceful Shutdown Handlers
  const shutdown = async (signal) => {
    logger.info(`\nReceived ${signal}, initiating graceful shutdown...`);
    await closeConnection();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Catch unhandled promise rejections
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection", { reason });
    shutdown("unhandledRejection");
  });
};

startWorker();
