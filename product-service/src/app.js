// src/app.js
import express from "express";
import helmet from "helmet";
import productRoutes from "./routes/productRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) =>
  res.status(200).json({ status: "OK", service: "product-service" }),
);

// Mount product routes
app.use("/", productRoutes);

app.use(errorHandler);

export { app };
