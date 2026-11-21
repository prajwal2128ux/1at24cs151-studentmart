import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res, next) => {
  const { items, shippingAddress } = req.body;
  const requiredAddress = ["fullName", "phone", "addressLine", "city", "state", "pincode"];
  if (!Array.isArray(items) || items.length === 0 ||
      !shippingAddress || requiredAddress.some(k => !String(shippingAddress[k] || "").trim())) {
    return res.status(400).json({ message: "Cart items and complete delivery address are required." });
  }

  const decremented = [];
  try {
    const orderItems = [];
    let totalAmount = 0;

    for (const requested of items) {
      if (!mongoose.isValidObjectId(requested.productId) ||
          !Number.isInteger(Number(requested.quantity)) || Number(requested.quantity) < 1) {
        throw Object.assign(new Error("Invalid cart item."), { status: 400 });
      }
      const product = await Product.findOneAndUpdate(
        { _id: requested.productId, stock: { $gte: Number(requested.quantity) } },
        { $inc: { stock: -Number(requested.quantity) } },
        { new: true }
      );
      if (!product) throw Object.assign(new Error("A product is unavailable or has insufficient stock. Refresh your cart."), { status: 409 });

      decremented.push({ id: product._id, quantity: Number(requested.quantity) });
      const lineTotal = product.price * Number(requested.quantity);
      totalAmount += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name || product.title || "Campus Item",
        title: product.title || product.name || "Campus Item",
        price: product.price,
        quantity: Number(requested.quantity),
        imageUrl: product.imageUrl || product.image || "",
        image: product.image || product.imageUrl || "",
        category: product.category || "Other"
      });
    }

    const order = await Order.create({
      user: req.user._id,
      customer: req.user._id,
      customerName: req.user.name || shippingAddress.fullName || "Customer",
      customerEmail: req.user.email || "",
      customerPhone: shippingAddress.phone || "",
      orderId: `SM-${Math.floor(1000 + Math.random() * 9000)}`,
      items: orderItems,
      shippingAddress,
      paymentMethod: "Campus Cash on Delivery (COD)",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      status: "Pending",
      totalAmount
    });
    res.status(201).json(order);
  } catch (error) {
    for (const item of decremented) {
      await Product.updateOne({ _id: item.id }, { $inc: { stock: item.quantity } }).catch(() => {});
    }
    next(error);
  }
});

router.get("/mine", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [{ user: req.user._id }, { customer: req.user._id }]
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { next(error); }
});

router.get("/", protect, requireAdmin, async (_req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { next(error); }
});

router.patch("/:id/status", protect, requireAdmin, async (req, res, next) => {
  try {
    const rawStatus = String(req.body.orderStatus || req.body.status || "").toUpperCase();
    const allowed = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowed.includes(rawStatus)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const currentStatus = String(order.orderStatus || order.status || "").toUpperCase();
    if (currentStatus === "CANCELLED" || currentStatus === "DELIVERED" || currentStatus === "COMPLETED") {
      return res.status(409).json({ message: "This order can no longer be changed." });
    }

    if (rawStatus === "CANCELLED" && currentStatus !== "CANCELLED") {
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const prodId = item.product || item._id;
          if (prodId) {
            await Product.updateOne({ _id: prodId }, { $inc: { stock: item.quantity || 1 } }).catch(() => {});
          }
        }
      }
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          orderStatus: rawStatus,
          status: rawStatus === "DELIVERED" ? "Completed" : rawStatus === "PLACED" ? "Pending" : rawStatus.charAt(0) + rawStatus.slice(1).toLowerCase()
        }
      },
      { new: true, runValidators: false }
    );

    res.json(updated);
  } catch (error) { next(error); }
});

export default router;