// src/rabbitmq/consumer.js
import amqp from "amqplib";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { sendOrderConfirmation } from "../services/notificationService.js";

let connection = null;
let channel = null;

export const startConsumer = async () => {
  try {
    // 1. Establish Connection
    connection = await amqp.connect(env.RABBITMQ_URL);

    // Process-level error handling for connection drops
    connection.on("error", (err) => {
      logger.error("RabbitMQ connection error", { error: err.message });
      process.exit(1); // Exit to let Docker/K8s restart the container
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed. Exiting...");
      process.exit(1);
    });

    // 2. Create Channel
    channel = await connection.createChannel();

    // 3. Assert Queue (durable: true ensures messages survive broker restarts)
    const queue = env.ORDER_EVENTS_QUEUE;
    await channel.assertQueue(queue, {
      durable: true,
      // In production, configure Dead Letter Exchanges (DLX) here for failed messages
    });

    // 4. Set Prefetch (Fair Dispatch)
    // Ensures this worker only processes 1 message at a time
    channel.prefetch(1);

    logger.info(`🎧 Waiting for messages in queue: '${queue}'`);

    // 5. Consume Messages
    channel.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          let payload;

          try {
            // Parse the incoming JSON event
            payload = JSON.parse(messageContent);
            logger.info("Received OrderPlaced event", {
              orderId: payload.orderId,
            });

            // Process the notification
            await sendOrderConfirmation(payload);

            // Acknowledge the message (removes it from the queue)
            channel.ack(msg);
          } catch (error) {
            logger.error("Failed to process message", {
              error: error.message,
              payload: messageContent,
            });

            // If JSON parsing fails, it's a poison pill.
            // We reject it (requeue: false) so it doesn't loop infinitely.
            // In a real system, this routes it to a Dead Letter Queue.
            channel.nack(msg, false, false);
          }
        }
      },
      {
        noAck: false, // We want manual acknowledgements for reliability
      },
    );
  } catch (error) {
    logger.error("Failed to start RabbitMQ consumer", { error: error.message });
    process.exit(1);
  }
};

export const closeConnection = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info("RabbitMQ connection closed gracefully.");
  } catch (error) {
    logger.error("Error closing RabbitMQ connection", { error: error.message });
  }
};
