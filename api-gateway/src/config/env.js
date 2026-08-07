// src/config/env.js
import { z } from 'zod';
import 'dotenv/config'; 

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  
  // SECRETS: Configured via environment variables only
  JWT_SECRET: z.string().min(10, 'JWT_SECRET is required and must be secure'),
  
  // DOWNSTREAM SERVICES: Configure these URLs in your cloud environment/Docker Compose
  USER_SERVICE_URL: z.string().url(),
  PRODUCT_SERVICE_URL: z.string().url(),
  INVENTORY_SERVICE_URL: z.string().url(),
  ORDER_SERVICE_URL: z.string().url(),
  
  // RATE LIMITING
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_TIME_WINDOW: z.string().default('1 minute')
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ API Gateway Config Error:', JSON.stringify(parseResult.error.format(), null, 2));
  process.exit(1);
}

export const env = parseResult.data;
