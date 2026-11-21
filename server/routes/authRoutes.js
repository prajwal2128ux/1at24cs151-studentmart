import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, cookieOptions } from "../middleware/authMiddleware.js";

const router = express.Router();

function issueToken(user, res) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("studentmart_token", token, cookieOptions());
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must contain at least 8 characters." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Public registration can ONLY create a normal user. Never accept a role from the client.
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: "user" });
    issueToken(user, res);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    issueToken(user, res);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
});

router.post("/logout", (req, res) => {
  res.clearCookie("studentmart_token", { ...cookieOptions(), maxAge: undefined });
  res.json({ message: "Logged out successfully." });
});

router.get("/me", protect, (req, res) => res.json({ user: req.user }));

export default router;