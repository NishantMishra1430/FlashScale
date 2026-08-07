// src/app.js
import express from "express";
import helmet from "helmet";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) =>
  res.status(200).json({ status: "OK", service: "inventory-service" }),
);
app.use("/", inventoryRoutes);
app.use(errorHandler);

export { app };
