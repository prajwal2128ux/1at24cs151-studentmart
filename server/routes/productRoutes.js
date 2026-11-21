
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import Product from "../models/Product.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Resolve the correct server/uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, "../uploads");

// Create uploads directory if it does not exist
fs.mkdirSync(uploadDir, { recursive: true });

console.log("Product upload directory:", uploadDir);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, uniqueName);
  }
});

// Validate image file types
const fileFilter = (_req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

// Helper to delete an image safely
const deleteImage = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
    return;
  }

  const filename = path.basename(imageUrl);
  const imagePath = path.join(uploadDir, filename);

  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
};

// GET all products (customer and admin)
router.get("/", async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// GET single product
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// ADD product (Admin only)
router.post(
  "/",
  protect,
  requireAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { name, description, price, category, stock } = req.body;

      if (!name || !description || !price || !category) {
        if (req.file) deleteImage(`/uploads/${req.file.filename}`);

        return res.status(400).json({
          message: "Please provide all required product details."
        });
      }

      const product = await Product.create({
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock || 0),
        imageUrl: req.file ? `/uploads/${req.file.filename}` : ""
      });

      res.status(201).json({
        message: "Product added successfully",
        product
      });
    } catch (error) {
      if (req.file) deleteImage(`/uploads/${req.file.filename}`);
      next(error);
    }
  }
);

// UPDATE product (Admin only)
router.put(
  "/:id",
  protect,
  requireAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        if (req.file) deleteImage(`/uploads/${req.file.filename}`);

        return res.status(404).json({
          message: "Product not found"
        });
      }

      const { name, description, price, category, stock } = req.body;

      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = Number(price);
      if (category !== undefined) product.category = category;
      if (stock !== undefined) product.stock = Number(stock);

      // Replace image only when a new image is uploaded
      if (req.file) {
        deleteImage(product.imageUrl);
        product.imageUrl = `/uploads/${req.file.filename}`;
      }

      await product.save();

      res.json({
        message: "Product updated successfully",
        product
      });
    } catch (error) {
      if (req.file) deleteImage(`/uploads/${req.file.filename}`);
      next(error);
    }
  }
);

// DELETE product (Admin only)
router.delete(
  "/:id",
  protect,
  requireAdmin,
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      deleteImage(product.imageUrl);

      await product.deleteOne();

      res.json({
        message: "Product deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
