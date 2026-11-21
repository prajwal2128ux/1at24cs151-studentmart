import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  customerName: { type: String, default: "" },
  customerEmail: { type: String, default: "" },
  customerPhone: { type: String, default: "" },
  customerUsn: { type: String, default: "" },
  orderId: {
    type: String,
    default: () => `SM-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`
  },
  deliveryLocation: { type: String, default: "" },
  deliveryNotes: { type: String, default: "" },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
    name: { type: String, default: "Campus Item" },
    title: { type: String, default: "Campus Item" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, default: "" },
    image: { type: String, default: "" },
    category: { type: String, default: "" }
  }],
  shippingAddress: {
    fullName: { type: String, default: "Campus Student" },
    phone: { type: String, default: "N/A" },
    addressLine: { type: String, default: "Campus Pickup" },
    city: { type: String, default: "Bengaluru" },
    state: { type: String, default: "Karnataka" },
    pincode: { type: String, default: "560024" }
  },
  paymentMethod: { type: String, default: "COD" },
  paymentStatus: { type: String, default: "PENDING" },
  orderStatus: {
    type: String,
    default: "PLACED"
  },
  status: {
    type: String,
    default: "Pending"
  },
  totalAmount: { type: Number, required: true, min: 0 }
}, {
  timestamps: true,
  strict: false,
  toJSON: {
    transform: (_doc, ret) => {
      // Normalize user / customer
      if (!ret.user && ret.customer) {
        ret.user = {
          _id: ret.customer,
          name: ret.customerName || "Customer",
          email: ret.customerEmail || ""
        };
      } else if (ret.user && typeof ret.user === "object") {
        ret.customerName = ret.customerName || ret.user.name || "Customer";
        ret.customerEmail = ret.customerEmail || ret.user.email || "";
      }

      ret.customer = ret.customer || ret.user?._id || ret.user;
      ret.customerName = ret.customerName || (typeof ret.user === "object" ? ret.user?.name : "") || "Customer";
      ret.customerEmail = ret.customerEmail || (typeof ret.user === "object" ? ret.user?.email : "") || "";

      // Normalize status / orderStatus
      const rawStatus = String(ret.orderStatus || ret.status || "PLACED").toUpperCase();
      let normalized = rawStatus;
      if (rawStatus === "PENDING") normalized = "PLACED";
      if (rawStatus === "COMPLETED") normalized = "DELIVERED";
      ret.orderStatus = normalized;
      ret.status = normalized;

      // Normalize items
      if (Array.isArray(ret.items)) {
        ret.items = ret.items.map(item => ({
          ...item,
          name: item.name || item.title || "Campus Item",
          title: item.title || item.name || "Campus Item",
          imageUrl: item.imageUrl || item.image || "",
          image: item.image || item.imageUrl || ""
        }));
      }

      // Normalize shippingAddress
      if (!ret.shippingAddress || !ret.shippingAddress.fullName) {
        ret.shippingAddress = {
          fullName: ret.customerName || "Campus Student",
          phone: ret.customerPhone || "N/A",
          addressLine: ret.deliveryLocation || "Campus Pickup Counter",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560024"
        };
      }

      return ret;
    }
  },
  toObject: {
    transform: (_doc, ret) => {
      ret.user = ret.user || ret.customer;
      ret.customer = ret.customer || ret.user;
      return ret;
    }
  }
});

// Keep status and orderStatus synchronized on save
orderSchema.pre("save", function (next) {
  if (this.user && !this.customer) this.customer = this.user;
  if (this.customer && !this.user) this.user = this.customer;
  if (this.orderStatus && !this.status) this.status = this.orderStatus;
  if (this.status && !this.orderStatus) this.orderStatus = this.status.toUpperCase();
  next();
});

export default mongoose.model("Order", orderSchema);
