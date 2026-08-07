// src/controllers/productController.js
import { Product } from "../models/productModel.js";
import { logger } from "../utils/logger.js";

export const getAllProducts = async (req, res, next) => {
  try {
    // Pagination defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({})
      .select("-__v") // Exclude internal version key
      .skip(skip)
      .limit(limit)
      .lean(); // Faster execution for read-only queries

    const total = await Product.countDocuments();

    res.status(200).json({
      success: true,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: products,
    });
  } catch (error) {
    logger.error("Error fetching products", { error: error.message });
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select("-__v").lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    logger.error(`Error fetching product ID ${req.params.id}`, {
      error: error.message,
    });
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    const newProduct = await Product.create(productData);

    logger.info("New product created", { productId: newProduct._id });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    logger.error("Error creating product", { error: error.message });
    next(error);
  }
};