// src/validators/orderValidator.js
import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    totalAmount: z.number().positive("Total amount is required"),
  }),
});
