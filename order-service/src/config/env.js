// src/config/env.js
import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3004"),

  // SECRETS
  JWT_SECRET: z
    .string()
    .min(10, "JWT_SECRET must be provided to verify user tokens"),

  // POSTGRES CREDENTIALS - Isolated DB for Order Service
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().default("5432"),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),

  // RABBITMQ CONNECTION STRING - Used for publishing OrderPlaced events
  // Format: amqp://username:password@host:port
  RABBITMQ_URL: z.string().url(),
  ORDER_EVENTS_QUEUE: z.string().default("order_notifications_queue"),

  // INVENTORY SERVICE URL - For synchronous REST calls
  INVENTORY_SERVICE_URL: z.string().url(),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error(
    JSON.stringify({
      level: "error",
      message: "Order Service Config Error",
      details: parseResult.error.format(),
    }),
  );
  process.exit(1);
}

export const env = parseResult.data;
