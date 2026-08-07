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
  max: 20, // Max number of connections in the pool
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle PostgreSQL client", {
    error: err.message,
  });
  process.exit(-1);
});

// Initialize the Users table if it doesn't exist
export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Database initialized: users table verified.");
  } finally {
    client.release();
  }
};
