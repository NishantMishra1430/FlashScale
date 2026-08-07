// src/services/inventoryClient.js
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const reserveInventory = async (productId, quantity, token) => {
  try {
    const response = await fetch(`${env.INVENTORY_SERVICE_URL}/reserve-stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward the auth token so the inventory service accepts the request
        Authorization: token,
      },
      body: JSON.stringify({ productId, quantity }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.warn("Inventory reservation failed", {
        productId,
        status: response.status,
        error: data.error,
      });
      return {
        success: false,
        reason: data.error || "Failed to reserve stock",
      };
    }

    return { success: true, data };
  } catch (error) {
    logger.error("Inventory Service unavailable", { error: error.message });
    return { success: false, reason: "Inventory Service unavailable" };
  }
};
