import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentmart";

async function syncOrders() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const orders = await db.collection("orders").find({}).toArray();

  for (const o of orders) {
    const user = o.user || o.customer;
    const customer = o.customer || o.user || user;
    const customerName = o.customerName || (o.user && typeof o.user === "object" ? o.user.name : "") || "Customer";
    const customerEmail = o.customerEmail || (o.user && typeof o.user === "object" ? o.user.email : "") || "";

    let rawStatus = String(o.orderStatus || o.status || "PLACED").toUpperCase();
    if (rawStatus === "PENDING") rawStatus = "PLACED";
    if (rawStatus === "COMPLETED") rawStatus = "DELIVERED";

    const items = (o.items || []).map(item => ({
      ...item,
      name: item.name || item.title || "Campus Item",
      title: item.title || item.name || "Campus Item",
      imageUrl: item.imageUrl || item.image || "",
      image: item.image || item.imageUrl || ""
    }));

    const shippingAddress = o.shippingAddress || {
      fullName: customerName,
      phone: o.customerPhone || "N/A",
      addressLine: o.deliveryLocation || "Campus Pickup Counter",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560024"
    };

    await db.collection("orders").updateOne(
      { _id: o._id },
      {
        $set: {
          user,
          customer,
          customerName,
          customerEmail,
          orderStatus: rawStatus,
          status: rawStatus === "DELIVERED" ? "Completed" : rawStatus === "PLACED" ? "Pending" : rawStatus.charAt(0) + rawStatus.slice(1).toLowerCase(),
          items,
          shippingAddress,
          paymentMethod: o.paymentMethod || "COD",
          paymentStatus: o.paymentStatus || "PENDING"
        }
      }
    );
  }

  console.log(`Successfully synchronized ${orders.length} orders.`);
  process.exit(0);
}

syncOrders().catch(err => {
  console.error("Order sync error:", err);
  process.exit(1);
});
