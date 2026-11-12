/**
 * StudentMart Role Helper Script
 * Usage:
 *   node server/setAdmin.js <email_or_usn>
 * 
 * If run without arguments, it lists all users and their current roles.
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./models/user");

async function main() {
  const target = process.argv[2];

  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is missing from server/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    if (!target) {
      console.log("=== Existing Users in Database ===");
      const users = await User.find({}, "name email usn role").lean();

      if (users.length === 0) {
        console.log("No users found in database. Register an account first via the UI.");
      } else {
        console.table(
          users.map((u) => ({
            Name: u.name || "(none)",
            Email: u.email,
            USN: u.usn,
            Role: u.role || "customer",
          }))
        );
        console.log("\nTo grant admin privileges to a user, run:");
        console.log(`  node server/setAdmin.js ${users[0].email}`);
        console.log("\nOr via MongoDB shell (mongosh):");
        console.log(`  db.users.updateOne({ email: "${users[0].email}" }, { $set: { role: "admin" } })\n`);
      }
      await mongoose.disconnect();
      return;
    }

    const cleanTarget = target.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanTarget.toLowerCase() },
        { usn: cleanTarget.toUpperCase() },
      ],
    });

    if (!user) {
      console.error(`User with email or USN "${target}" not found.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`Success! User "${user.name || user.email}" (${user.email}, USN: ${user.usn}) is now an ADMIN.`);
    console.log("You can now log in with this account to view the /admin/dashboard.\n");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Failed to update user role:", err.message);
    process.exit(1);
  }
}

main();

