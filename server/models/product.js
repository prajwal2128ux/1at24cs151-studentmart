const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 20,
    },
    category: {
      type: String,
      default: "Books",
      trim: true,
    },
    desc: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
