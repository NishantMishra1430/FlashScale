// src/config/redis.js
import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redisClient.on("connect", () =>
  logger.info("Connected to Redis for atomic operations"),
);
redisClient.on("error", (err) =>
  logger.error("Redis connection error", { error: err.message }),
);

// Define Lua Script for Atomic Stock Deduction
// Returns: 1 (Success), 0 (Insufficient Stock), -1 (Stock not loaded in Redis)
redisClient.defineCommand("atomicReserveStock", {
  numberOfKeys: 1,
  lua: `
    local current_stock = tonumber(redis.call('get', KEYS[1]))
    local requested_quantity = tonumber(ARGV[1])
    
    if current_stock == nil then
      return -1
    end
    
    if current_stock >= requested_quantity then
      redis.call('decrby', KEYS[1], requested_quantity)
      return 1
    else
      return 0
    end
  `,
});
