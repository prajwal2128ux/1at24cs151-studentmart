import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String, required: true,
    enum: ["Electronics", "Books", "Stationery", "Accessories", "Clothing", "Other"]
  },
  stock: { type: Number, required: true, min: 0, default: 0 },
  imageUrl: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);