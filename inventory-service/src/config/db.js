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
      CREATE TABLE IF NOT EXISTS inventory (
        product_id VARCHAR(255) PRIMARY KEY,
        available_stock INT NOT NULL CHECK (available_stock >= 0),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Database initialized: inventory table verified.");
  } finally {
    client.release();
  }
};
