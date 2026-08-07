// src/config/db.js
import pkg from "pg";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const { Pool } = pkg;

export const pool = new Pool({
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT, 10),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 20,
});

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
      
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status order_status NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Database initialized: orders table verified.");
  } catch (error) {
    // Ignore ENUM already exists error
    if (error.code !== "42710") throw error;
  } finally {
    client.release();
  }
};
