// src/validators/productValidator.js
import { z } from "zod";
import mongoose from "mongoose";

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be greater than zero"),
    totalStock: z
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative"),
    category: z.string().min(2, "Category must be at least 2 characters"),
  }),
});

// Helper to validate MongoDB Object IDs in params
export const objectIdSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid Product ID format",
    }),
  }),
});
