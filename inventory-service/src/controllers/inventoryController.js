// src/controllers/inventoryController.js
import { redisClient } from "../config/redis.js";
import * as inventoryModel from "../models/inventoryModel.js";
import { logger } from "../utils/logger.js";

export const reserveStock = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const redisKey = `inventory:${productId}`;

    // 1. Attempt atomic deduction in Redis
    let result = await redisClient.atomicReserveStock(redisKey, quantity);

    // 2. Cache-Aside Pattern: If stock is not in Redis (-1), hydrate from DB
    if (result === -1) {
      logger.info("Stock not in Redis cache. Hydrating from Database...", {
        productId,
      });

      const dbStock = await inventoryModel.getStockFromDb(productId);

      if (dbStock === null) {
        return res
          .status(404)
          .json({ success: false, error: "Product not found in inventory" });
      }

      // Load into Redis and try deduction again
      await redisClient.set(redisKey, dbStock);
      result = await redisClient.atomicReserveStock(redisKey, quantity);
    }

    // 3. Evaluate atomic deduction result
    if (result === 0) {
      return res.status(409).json({
        success: false,
        error: "Insufficient stock available",
      });
    }

    // 4. Async Sync to PostgreSQL (Fire & Forget to keep endpoint hyper-fast)
    // In a hyper-scale system, you would publish this to RabbitMQ here instead.
    inventoryModel
      .deductStockInDb(productId, quantity)
      .then((remainingDbStock) => {
        logger.info("Database stock synced successfully", {
          productId,
          remainingDbStock,
        });
      })
      .catch((dbErr) => {
        // Critical Error: Redis is deducted, but DB sync failed.
        // Requires a Dead Letter Queue or reconciliation worker in production.
        logger.error("CRITICAL: DB sync failed after Redis deduction", {
          productId,
          quantity,
          error: dbErr.message,
        });
      });

    return res.status(200).json({
      success: true,
      message: "Stock reserved successfully",
      data: { productId, reservedQuantity: quantity },
    });
  } catch (error) {
    logger.error("Error reserving stock", { error: error.message });
    next(error);
  }
};
