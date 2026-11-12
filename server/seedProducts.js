const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const Product = require("./models/product");

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

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(defaultSeedProducts);
    console.log("Successfully seeded 4 screenshot catalog products to MongoDB!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

seed();

