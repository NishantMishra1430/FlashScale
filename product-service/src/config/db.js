// src/config/db.js
import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  try {
    // Uses the isolated MongoDB connection string from environment variables
    const conn = await mongoose.connect(env.MONGO_URI, {
      autoIndex: env.NODE_ENV !== "production", // Disable autoIndex in production for performance
      maxPoolSize: 20, // Connection pool size
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Error connecting to MongoDB", { error: error.message });
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.error("MongoDB connection lost. Attempting to reconnect...");
});
