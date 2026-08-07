// src/middlewares/errorHandler.js
import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled Exception", {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.name || "Server Error",
    message: err.message || "An unexpected error occurred",
  });
};
