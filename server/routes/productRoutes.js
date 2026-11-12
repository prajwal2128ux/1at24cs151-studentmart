const express = require("express");
const Product = require("../models/product");
const { authenticate, isAdmin } = require("../middleware/auth");

const router = express.Router();

const defaultSeedProducts = [
  {
    title: "Casio FX-991CW Scientific Calculator",
    price: 1250,
    stock: 15,
    category: "Gadgets",
    desc: "Advanced engineering calculator with solar + battery backup, authorized for exams.",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Campus Waterproof Laptop Backpack",
    price: 899,
    stock: 20,
    category: "College Bags",
    desc: "Durable 25L backpack with 15.6 inch padded laptop sleeve and water bottle holder.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Engineering Drawing & Drafting Kit",
    price: 450,
    stock: 30,
    category: "Stationery",
    desc: "Complete mini-drafter, compass, set squares, and scale sheet clips in travel case.",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Official StudentMart Campus Hoodie",
    price: 999,
    stock: 25,
    category: "Uniform",
    desc: "Premium fleece pullover college hoodie with embroidered campus crest.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
  },
];

/* Helper to format product consistently */
function formatProduct(p) {
  return {
    id: p._id.toString(),
    _id: p._id.toString(),
    title: p.title,
    name: p.title,
    price: p.price,
    stock: p.stock !== undefined ? p.stock : 20,
    category: p.category || "Books",
    desc: p.desc || "",
    description: p.desc || "",
    image: p.image || "",
    createdBy: p.createdBy,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/* =========================================
   GET ALL PRODUCTS
   GET /api/products
   Public for both Admin and Customer view
   ========================================= */
router.get("/", async (req, res) => {
  try {
    let count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(defaultSeedProducts);
    }

    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      products: products.map(formatProduct),
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve products.",
    });
  }
});

/* =========================================
   CREATE PRODUCT (ADMIN ONLY)
   POST /api/products
   ========================================= */
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const title = (req.body.title || req.body.name || "").trim();
    const rawPrice = req.body.price;
    const stock = req.body.stock !== undefined && !isNaN(Number(req.body.stock)) ? Number(req.body.stock) : 20;
    const category = (req.body.category || "Books").trim();
    const desc = (req.body.desc || req.body.description || "").trim();
    const image = (req.body.image || "").trim();

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Product title/name is required.",
      });
    }

    if (rawPrice === undefined || rawPrice === "" || isNaN(Number(rawPrice))) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required.",
      });
    }

    const price = Number(rawPrice);
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative.",
      });
    }

    const product = new Product({
      title,
      price,
      stock,
      category,
      desc: desc || "Available for campus pickup.",
      image: image || "",
      createdBy: req.user._id,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: `Product "${title}" added successfully.`,
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating product.",
    });
  }
});

/* =========================================
   UPDATE PRODUCT (ADMIN ONLY)
   PUT /api/products/:id
   ========================================= */
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const title = req.body.title || req.body.name;
    const rawPrice = req.body.price;
    const stock = req.body.stock;
    const category = req.body.category;
    const desc = req.body.desc !== undefined ? req.body.desc : req.body.description;
    const image = req.body.image;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (rawPrice !== undefined && !isNaN(Number(rawPrice))) updates.price = Number(rawPrice);
    if (stock !== undefined && !isNaN(Number(stock))) updates.stock = Number(stock);
    if (category !== undefined) updates.category = category.trim();
    if (desc !== undefined) updates.desc = desc.trim();
    if (image !== undefined) updates.image = image.trim();

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product "${updated.title}" updated successfully.`,
      product: formatProduct(updated),
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating product.",
    });
  }
});

/* =========================================
   DELETE PRODUCT (ADMIN ONLY)
   DELETE /api/products/:id
   ========================================= */
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product "${deleted.title}" deleted successfully.`,
      productId: req.params.id,
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error deleting product.",
    });
  }
});

module.exports = router;
