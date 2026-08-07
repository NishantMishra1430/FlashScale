// src/controllers/orderController.js
import { pool } from "../config/db.js";
import { publishOrderEvent } from "../config/rabbitmq.js";
import { reserveInventory } from "../services/inventoryClient.js";
import { logger } from "../utils/logger.js";

export const placeOrder = async (req, res, next) => {
  const { productId, quantity, totalAmount } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Obtain a dedicated client from the pool to manage the transaction
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Start Transaction

    // 1. Create order as PENDING
    const insertQuery = `
      INSERT INTO orders (user_id, product_id, quantity, total_amount, status) 
      VALUES ($1, $2, $3, $4, 'PENDING') 
      RETURNING id, status, created_at;
    `;
    const orderResult = await client.query(insertQuery, [
      userId,
      productId,
      quantity,
      totalAmount,
    ]);
    const order = orderResult.rows[0];

    logger.info("Order created as PENDING", { orderId: order.id, userId });

    // 2. Talk to Inventory Service synchronously
    const inventoryResult = await reserveInventory(
      productId,
      quantity,
      req.token,
    );

    if (!inventoryResult.success) {
      // Rollback transaction to prevent stranding incomplete data
      await client.query("ROLLBACK");

      // Optionally, you could execute a new transaction here to log a 'FAILED' order status,
      // but discarding it via ROLLBACK is cleaner for high-throughput flash sales.

      logger.warn("Order failed due to inventory constraint", {
        orderId: order.id,
        reason: inventoryResult.reason,
      });

      return res.status(409).json({
        success: false,
        error: "Order could not be fulfilled",
        details: inventoryResult.reason,
      });
    }

    // 3. Update order to CONFIRMED
    const updateQuery = `
      UPDATE orders SET status = 'CONFIRMED' WHERE id = $1 RETURNING status;
    `;
    await client.query(updateQuery, [order.id]);

    await client.query("COMMIT"); // Commit Transaction

    logger.info("Order CONFIRMED successfully", { orderId: order.id });

    // 4. Fire Async Event to RabbitMQ (Notification Service consumes this)
    publishOrderEvent({
      orderId: order.id,
      userId,
      email: userEmail,
      productId,
      quantity,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { orderId: order.id, status: "CONFIRMED" },
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on any unexpected failure
    logger.error("Transaction rolled back due to error", {
      error: error.message,
    });
    next(error);
  } finally {
    client.release(); // Return client to the pool
  }
};
