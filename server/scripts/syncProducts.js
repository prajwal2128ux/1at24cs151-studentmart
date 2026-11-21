import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentmart";

async function sync() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const products = await db.collection("products").find({}).toArray();

  for (const p of products) {
    const name = p.name || p.title || "Campus Product";
    const title = p.title || p.name || name;
    const description = p.description || p.desc || "Available for campus pickup.";
    const desc = p.desc || p.description || description;
    const imageUrl = p.imageUrl || p.image || "";
    const image = p.image || p.imageUrl || imageUrl;

    await db.collection("products").updateOne(
      { _id: p._id },
      { $set: { name, title, description, desc, imageUrl, image } }
    );
  }

  console.log(`Successfully synchronized ${products.length} products.`);
  process.exit(0);
}

sync().catch(err => {
  console.error("Sync error:", err);
  process.exit(1);
});
