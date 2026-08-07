// src/middlewares/auth.js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized, token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // { id, email, ... }
    req.token = authHeader; // Save token to forward to downstream services
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized, invalid token" });
  }
};
