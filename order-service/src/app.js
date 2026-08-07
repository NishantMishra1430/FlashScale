// src/app.js
import express from "express";
import helmet from "helmet";
import orderRoutes from "./routes/orderRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) =>
  res.status(200).json({ status: "OK", service: "order-service" }),
);
app.use("/", orderRoutes);
app.use(errorHandler);

export { app };
