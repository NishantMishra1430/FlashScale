// src/config/rabbitmq.js
import amqp from "amqplib";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(env.ORDER_EVENTS_QUEUE, { durable: true });

    logger.info("Connected to RabbitMQ for event publishing");

    connection.on("error", (err) =>
      logger.error("RabbitMQ Error", { error: err.message }),
    );
    connection.on("close", () => logger.error("RabbitMQ Connection Closed"));
  } catch (error) {
    logger.error("Failed to connect to RabbitMQ", { error: error.message });
    process.exit(1);
  }
};

export const publishOrderEvent = (orderData) => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");

  const payload = Buffer.from(JSON.stringify(orderData));
  channel.sendToQueue(env.ORDER_EVENTS_QUEUE, payload, { persistent: true });

  logger.info("Event published to RabbitMQ", {
    event: "OrderPlaced",
    orderId: orderData.orderId,
  });
};

export const closeRabbitMQ = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};
