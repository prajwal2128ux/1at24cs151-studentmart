import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String, default: "", trim: true, maxlength: 20 },
  avatar: { type: String, default: "" },
  department: { type: String, default: "", trim: true, maxlength: 100 },
  campusAddress: { type: String, default: "", trim: true, maxlength: 200 },
  bio: { type: String, default: "", trim: true, maxlength: 240 },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
