// src/app.js
import express from "express";
import helmet from "helmet";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Core Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON payloads

// Health Check Endpoint (used by container orchestrators like K8s)
app.get("/health", (req, res) =>
  res.status(200).json({ status: "OK", service: "user-service" }),
);

// Service Routes
app.use("/", userRoutes);

// Global Error Handler
app.use(errorHandler);

export { app };
