// src/routes/inventoryRoutes.js
import { Router } from "express";
import * as inventoryController from "../controllers/inventoryController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { reserveStockSchema } from "../validators/inventoryValidator.js";

const router = Router();

// Protected by the API Gateway's JWT middleware
router.post(
  "/reserve-stock",
  validateRequest(reserveStockSchema),
  inventoryController.reserveStock,
);

export default router;
