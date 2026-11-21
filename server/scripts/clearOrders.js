import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentmart";

async function clearOrders() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const result = await db.collection("orders").deleteMany({});
  console.log(`Successfully deleted ${result.deletedCount} orders.`);

  const remaining = await db.collection("orders").countDocuments();
  console.log(`Remaining orders: ${remaining}`);

  process.exit(0);
}

clearOrders().catch(err => {
  console.error("Error clearing orders:", err);
  process.exit(1);
});
