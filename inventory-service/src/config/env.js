// src/config/env.js
import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3003"),

  // REDIS CREDENTIALS - Used for atomic stock deduction
  REDIS_URL: z.string().url("REDIS_URL must be a valid connection string"),

  // POSTGRES CREDENTIALS - Used for durable stock sync
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().default("5432"),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error(
    JSON.stringify({
      level: "error",
      message: "Inventory Service Config Error",
      details: parseResult.error.format(),
    }),
  );
  process.exit(1);
}

export const env = parseResult.data;
