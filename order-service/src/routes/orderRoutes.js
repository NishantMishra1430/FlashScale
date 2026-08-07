// src/routes/orderRoutes.js
import { Router } from "express";
import * as orderController from "../controllers/orderController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { requireAuth } from "../middlewares/auth.js";
import { createOrderSchema } from "../validators/orderValidator.js";

const router = Router();

// Endpoint secured by Auth middleware. (Gateway may also verify, but we double-check local claims)
router.post(
  "/",
  requireAuth,
  validateRequest(createOrderSchema),
  orderController.placeOrder,
);

export default router;
