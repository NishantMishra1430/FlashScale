// src/routes/productRoutes.js
import { Router } from "express";
import * as productController from "../controllers/productController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
  createProductSchema,
  objectIdSchema,
} from "../validators/productValidator.js";

const router = Router();

// Public Routes (No auth required at gateway level for these)
router.get("/", productController.getAllProducts);
router.get(
  "/:id",
  validateRequest(objectIdSchema),
  productController.getProductById,
);

// Protected Admin Route (Gateway should ideally secure this path, plus internal role check)
router.post(
  "/",
  requireAdmin,
  validateRequest(createProductSchema),
  productController.createProduct,
);

export default router;
