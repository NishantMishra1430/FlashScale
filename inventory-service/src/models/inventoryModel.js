// src/models/inventoryModel.js
import { pool } from "../config/db.js";

export const getStockFromDb = async (productId) => {
  const result = await pool.query(
    "SELECT available_stock FROM inventory WHERE product_id = $1",
    [productId],
  );
  return result.rows[0]?.available_stock ?? null;
};

// Deduct stock in Postgres (used for synchronization after Redis succeeds)
export const deductStockInDb = async (productId, quantity) => {
  const result = await pool.query(
    `UPDATE inventory 
     SET available_stock = available_stock - $1, updated_at = CURRENT_TIMESTAMP 
     WHERE product_id = $2 AND available_stock >= $1 
     RETURNING available_stock`,
    [quantity, productId],
  );
  return result.rows[0]?.available_stock;
};

// Seed initial stock (Admin utility)
export const setInitialStockDb = async (productId, stock) => {
  await pool.query(
    `INSERT INTO inventory (product_id, available_stock) 
     VALUES ($1, $2) 
     ON CONFLICT (product_id) DO UPDATE SET available_stock = $2`,
    [productId, stock],
  );
};
