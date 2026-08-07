// src/config/env.js
import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3002"),

  // MONGODB CONNECTION STRING - Configured via environment variables only
  MONGO_URI: z.string().url("MONGO_URI must be a valid connection string"),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error(
    JSON.stringify({
      level: "error",
      message: "Product Service Config Error",
      details: parseResult.error.format(),
    }),
  );
  process.exit(1);
}

export const env = parseResult.data;
