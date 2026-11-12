const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Enable CORS for all requests
app.use(cors());

// Support large Base64 image payloads up to 50MB
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static uploads
app.use("/uploads", express.static(uploadsDir));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "StudentMart API is running" });
});

// Authentication routes
app.use("/api/auth", require("./routes/authRoutes"));

// Product routes (mounted at both /api/products and /api/admin/products for full compatibility)
const productRouter = require("./routes/productRoutes");
app.use("/api/products", productRouter);
app.use("/api/admin/products", productRouter);

// Catch-all 404 handler for all unmatched API endpoints (ALWAYS JSON, never HTML)
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global JSON error handler (handles Multer errors, body-parser limit 413, JSON parse errors)
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err.message);
  const status =
    err.status ||
    err.statusCode ||
    (err.type === "entity.too.large" || err.code === "LIMIT_FILE_SIZE" ? 413 : 500);

  return res.status(status).json({
    success: false,
    message:
      status === 413
        ? "Uploaded image is too large. Please use an image file under 10MB or paste an image URL."
        : err.message || "A server error occurred.",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from server/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
  }
}

startServer();
