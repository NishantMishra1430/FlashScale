// src/controllers/userController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import * as userModel from "../models/userModel.js";
import { logger } from "../utils/logger.js";

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check for existing user
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: "User with this email already exists" });
    }

    // Hash password (cost factor 12 is standard for production)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in isolated PostgreSQL database
    const user = await userModel.createUser(email, passwordHash, name);

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    logger.info("User registered successfully", { userId: user.id });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user, token },
    });
  } catch (error) {
    logger.error("Signup error", { error: error.message });
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Retrieve user
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    logger.info("User logged in successfully", { userId: user.id });

    // Exclude password_hash from response payload
    const { password_hash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      data: { user: safeUser, token },
    });
  } catch (error) {
    logger.error("Login error", { error: error.message });
    next(error);
  }
};
