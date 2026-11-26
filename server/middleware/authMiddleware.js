import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const token = req.cookies?.studentmart_token;
    if (!token) return res.status(401).json({ message: "Please log in to continue." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "name email role phone avatar department campusAddress bio createdAt"
    );
    if (!user) return res.status(401).json({ message: "Account no longer exists." });

    req.user = user;
    next();
  } catch {
    res.clearCookie("studentmart_token", cookieOptions());
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Administrator access required." });
  }
  next();
}

export function cookieOptions() {
  const production = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  };
}