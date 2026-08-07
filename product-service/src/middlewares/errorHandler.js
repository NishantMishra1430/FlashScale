// src/middlewares/errorHandler.js
import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled Exception", {
    message: err.message,
    stack: err.stack,
  });

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    return res
      .status(400)
      .json({ success: false, error: "Duplicate field value entered" });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.name || "Server Error",
    message: err.message || "An unexpected error occurred",
  });
};
