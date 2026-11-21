
import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireAdmin);

// Include every account except admin accounts.
// This also handles customer roles other than "user".
const customerFilter = {
  role: { $not: /^admin$/i }
};

// GET all customers
router.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find(customerFilter)
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET admin dashboard statistics
router.get("/stats", async (_req, res, next) => {
  try {
    const [users, orders, revenue] = await Promise.all([
      User.countDocuments(customerFilter),
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            orderStatus: { $ne: "CANCELLED" }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ])
    ]);

    res.json({
      users,
      orders,
      orderValue: revenue[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
});

export default router;
