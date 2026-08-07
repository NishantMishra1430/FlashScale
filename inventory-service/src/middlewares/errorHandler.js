// src/middlewares/errorHandler.js
import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled Exception", {
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({
    success: false,
    error: "Server Error",
    message: "An unexpected error occurred while processing inventory",
  });
};
