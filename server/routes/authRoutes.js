import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import { protect, cookieOptions } from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, or WEBP profile images are allowed."));
    }
    cb(null, true);
  }
});

function deleteLocalAvatar(avatarPath) {
  if (!avatarPath || !avatarPath.startsWith("/uploads/avatar-")) return;
  const target = path.join(uploadDir, path.basename(avatarPath));
  fs.unlink(target, () => {});
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    avatar: user.avatar || "",
    department: user.department || "",
    campusAddress: user.campusAddress || "",
    bio: user.bio || "",
    createdAt: user.createdAt
  };
}

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
    res.status(201).json({ user: serializeUser(user) });
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
    res.json({ user: serializeUser(user) });
  } catch (error) { next(error); }
});

router.post("/logout", (req, res) => {
  res.clearCookie("studentmart_token", { ...cookieOptions(), maxAge: undefined });
  res.json({ message: "Logged out successfully." });
});

router.get("/me", protect, (req, res) => res.json({ user: serializeUser(req.user) }));

// Update current authenticated user's own profile (Student or Admin)
router.put("/profile", protect, avatarUpload.single("avatar"), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      if (req.file) deleteLocalAvatar(`/uploads/${req.file.filename}`);
      return res.status(404).json({ message: "Account not found." });
    }

    const name = String(req.body.name ?? user.name ?? "").trim();
    const email = String(req.body.email ?? user.email ?? "").trim().toLowerCase();
    const phone = String(req.body.phone ?? user.phone ?? "").trim();
    const department = String(req.body.department ?? user.department ?? "").trim();
    const campusAddress = String(req.body.campusAddress ?? user.campusAddress ?? "").trim();
    const bio = String(req.body.bio ?? user.bio ?? "").trim();
    const removeAvatar = req.body.removeAvatar === true || req.body.removeAvatar === "true";

    if (!name || name.length > 80) {
      if (req.file) deleteLocalAvatar(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: "Full name is required (max 80 characters)." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (req.file) deleteLocalAvatar(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (phone && !/^[+\d\s()-]{7,20}$/.test(phone)) {
      if (req.file) deleteLocalAvatar(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: "Enter a valid phone number (7 to 20 digits)." });
    }

    if (department.length > 100 || campusAddress.length > 200 || bio.length > 240) {
      if (req.file) deleteLocalAvatar(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: "One or more profile fields exceed the allowed length." });
    }

    if (email !== user.email) {
      const emailTaken = await User.exists({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        if (req.file) deleteLocalAvatar(`/uploads/${req.file.filename}`);
        return res.status(409).json({ message: "That email address is already used by another account." });
      }
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    user.department = department;
    if (user.role !== "admin") {
      user.campusAddress = campusAddress;
    }
    user.bio = bio;

    if (req.file) {
      deleteLocalAvatar(user.avatar);
      user.avatar = `/uploads/${req.file.filename}`;
    } else if (removeAvatar) {
      deleteLocalAvatar(user.avatar);
      user.avatar = "";
    }

    await user.save();
    res.json({
      message: "Profile updated successfully.",
      user: serializeUser(user)
    });
  } catch (error) {
    if (req.file) deleteLocalAvatar(`/uploads/${req.file.filename}`);
    next(error);
  }
});

// Secure separate password change for the authenticated user
router.put("/password", protect, async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must contain at least 8 characters." });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from your current password." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();
    issueToken(user, res);
    res.json({ message: "Password updated successfully." });
  } catch (error) { next(error); }
});

export default router;
