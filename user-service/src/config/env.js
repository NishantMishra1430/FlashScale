// src/config/env.js
import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3001"),

  // POSTGRES DATABASE SECRETS - Configured via environment variables
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.string().default("5432"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),

  // JWT Configuration
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be secure"),
  JWT_EXPIRES_IN: z.string().default("1h"),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error(
    JSON.stringify({
      level: "error",
      message: "User Service Config Error",
      details: parseResult.error.format(),
    }),
  );
  process.exit(1);
}

export const env = parseResult.data;
