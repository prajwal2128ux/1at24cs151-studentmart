import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 120 },
  title: { type: String, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000 },
  desc: { type: String, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  imageUrl: { type: String, default: "" },
  image: { type: String, default: "" }
}, {
  timestamps: true,
  strict: false,
  toJSON: {
    transform: (_doc, ret) => {
      ret.name = ret.name || ret.title || "";
      ret.title = ret.title || ret.name || "";
      ret.description = ret.description || ret.desc || "";
      ret.desc = ret.desc || ret.description || "";
      ret.imageUrl = ret.imageUrl || ret.image || "";
      ret.image = ret.image || ret.imageUrl || "";
      return ret;
    }
  },
  toObject: {
    transform: (_doc, ret) => {
      ret.name = ret.name || ret.title || "";
      ret.title = ret.title || ret.name || "";
      ret.description = ret.description || ret.desc || "";
      ret.desc = ret.desc || ret.description || "";
      ret.imageUrl = ret.imageUrl || ret.image || "";
      ret.image = ret.image || ret.imageUrl || "";
      return ret;
    }
  }
});

// Middleware to keep dual fields in sync on save
productSchema.pre("save", function (next) {
  if (this.name && !this.title) this.title = this.name;
  if (this.title && !this.name) this.name = this.title;
  if (this.description && !this.desc) this.desc = this.description;
  if (this.desc && !this.description) this.description = this.desc;
  if (this.imageUrl && !this.image) this.image = this.imageUrl;
  if (this.image && !this.imageUrl) this.imageUrl = this.image;
  next();
});

export default mongoose.model("Product", productSchema);
