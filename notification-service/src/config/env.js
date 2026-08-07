// src/config/env.js
import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // RABBITMQ CONNECTION STRING - Configured via environment variables only
  // Format: amqp://username:password@host:port
  RABBITMQ_URL: z
    .string()
    .url("RABBITMQ_URL must be a valid AMQP connection string"),

  // The queue name to listen to
  ORDER_EVENTS_QUEUE: z.string().default("order_notifications_queue"),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error(
    JSON.stringify({
      level: "error",
      message: "Notification Service Config Error",
      details: parseResult.error.format(),
    }),
  );
  process.exit(1);
}

export const env = parseResult.data;
