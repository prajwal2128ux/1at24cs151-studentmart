import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

if (!process.env.MONGO_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error("Set MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.");
}
if (process.env.ADMIN_PASSWORD.length < 12) {
  throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
}

await mongoose.connect(process.env.MONGO_URI);
const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
let admin = await User.findOne({ email });

if (admin) {
  admin.name = process.env.ADMIN_NAME || "StudentMart Administrator";
  admin.role = "admin";
  admin.password = process.env.ADMIN_PASSWORD;
  await admin.save();
  console.log(`Admin account updated: ${email}`);
} else {
  admin = await User.create({
    name: process.env.ADMIN_NAME || "StudentMart Administrator",
    email,
    password: process.env.ADMIN_PASSWORD,
    role: "admin"
  });
  console.log(`Admin account created: ${email}`);
}
await mongoose.disconnect();