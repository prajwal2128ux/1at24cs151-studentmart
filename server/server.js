
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Resolve the server folder reliably
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload images inside server/uploads
const uploadDir = path.join(__dirname, "uploads");

const app = express();
const PORT = process.env.PORT || 5000;

// Validate environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be set to a random value of at least 32 characters."
  );
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing.");
}

if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL is missing.");
}

// Security middleware

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);


app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Serve uploaded product images
app.use(
  "/uploads",
  express.static(uploadDir, {
    dotfiles: "deny",
    index: false
  })
);

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Try again later."
  }
});

// API health check
app.get("/", (_req, res) => {
  res.json({
    message: "StudentMart API is running."
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID."
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "That email is already registered."
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Image must be 5 MB or smaller."
    });
  }

  if (err.message?.includes("Only JPG")) {
    return res.status(400).json({
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Server error."
  });
});

// Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    console.log("Image directory:", uploadDir);

    app.listen(PORT, () => {
      console.log(`StudentMart API running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
