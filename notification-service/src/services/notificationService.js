// src/services/notificationService.js
import { logger } from "../utils/logger.js";

/**
 * Simulates sending an order confirmation email and SMS.
 * In a real application, you would integrate with SendGrid, Twilio, etc. here.
 */
export const sendOrderConfirmation = async (orderData) => {
  const { orderId, email, totalAmount } = orderData;

  return new Promise((resolve, reject) => {
    logger.info("Preparing to send notification...", { orderId, email });

    // Simulate network latency for external provider API call (e.g., 500ms)
    setTimeout(() => {
      try {
        // Validation check just in case malformed data reaches this layer
        if (!email) throw new Error("Missing destination email address");

        logger.info("✅ Email confirmation sent successfully", {
          orderId,
          email,
          subject: `Your FlashScale Order #${orderId} is confirmed!`,
          amount: totalAmount,
        });

        resolve(true);
      } catch (error) {
        logger.error("❌ Failed to send email", {
          orderId,
          error: error.message,
        });
        reject(error);
      }
    }, 500);
  });
};
