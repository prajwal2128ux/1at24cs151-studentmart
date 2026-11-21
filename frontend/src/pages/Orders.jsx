import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Package, Calendar, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../api";

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/mine")
      .then(r => setOrders(r.data))
      .catch(e => setError(e.response?.data?.message || "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = date => {
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return String(date);
    }
  };

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">PURCHASE HISTORY</span>
          <h1>My Orders</h1>
          <p>Track your campus marketplace orders and delivery status.</p>
        </div>
        <Link className="primary-action" to="/shop/products">
          <ShoppingBag size={17} /> Continue Shopping
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading your order history...</div>
      ) : orders.length === 0 ? (
        <div className="products-empty">
          <Package size={44} />
          <h3>No orders placed yet</h3>
          <p>When you purchase textbooks or campus gear, your order receipts will appear here.</p>
          <Link className="primary-action" to="/shop/products" style={{ marginTop: "12px" }}>
            Browse Campus Catalog <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map(o => (
            <article className="order-card" key={o._id}>
              <div className="order-card-head">
                <strong>Order #{o._id.slice(-8).toUpperCase()}</strong>
                <span className={`role-pill status-${(o.orderStatus || "").toLowerCase()}`}>
                  {o.orderStatus}
                </span>
              </div>

              <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={13} /> {formatDate(o.createdAt)}
              </p>

              <div className="order-items-box">
                {o.items.map((i, n) => (
                  <div className="order-line" key={n}>
                    <span>{i.name} × {i.quantity}</span>
                    <strong>₹{(i.price * i.quantity).toLocaleString("en-IN")}</strong>
                  </div>
                ))}
              </div>

              <div className="summary-total" style={{ marginTop: "12px", borderTop: "1px solid var(--border-light)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Payment on Delivery</span>
                <strong>₹{o.totalAmount.toLocaleString("en-IN")}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/orders")
      .then(r => setOrders(r.data))
      .catch(e => setError(e.response?.data?.message || "Unable to load orders."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id, orderStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { orderStatus });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Status update failed.");
    }
  };

  const formatDate = date => {
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return String(date);
    }
  };

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">FULFILLMENT & LOGISTICS</span>
          <h1>Customer Orders</h1>
          <p>Track student order status, update delivery progress and manage handovers.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading customer orders...</div>
      ) : orders.length === 0 ? (
        <div className="products-empty">
          <Package size={44} />
          <h3>No customer orders found</h3>
          <p>New orders submitted by students will appear in this console.</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map(o => (
            <article className="order-card" key={o._id}>
              <div className="order-card-head">
                <strong>#{o._id.slice(-8).toUpperCase()} · {o.user?.name || "Customer"}</strong>
                <span className={`role-pill status-${(o.orderStatus || "").toLowerCase()}`}>
                  {o.orderStatus}
                </span>
              </div>

              <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{o.user?.email}</span> • <span>{formatDate(o.createdAt)}</span>
              </p>

              <div className="order-items-box">
                {o.items.map((i, n) => (
                  <div className="order-line" key={n}>
                    <span>{i.name} × {i.quantity}</span>
                    <strong>₹{(i.price * i.quantity).toLocaleString("en-IN")}</strong>
                  </div>
                ))}
              </div>

              <div className="order-card-foot">
                <div>
                  <small style={{ display: "block", color: "var(--text-muted)", fontSize: "11px" }}>Total Amount</small>
                  <strong>₹{o.totalAmount.toLocaleString("en-IN")} (COD)</strong>
                </div>

                <select 
                  value={o.orderStatus} 
                  onChange={e => update(o._id, e.target.value)} 
                  disabled={["DELIVERED", "CANCELLED"].includes(o.orderStatus)}
                >
                  <option value="PLACED">Placed</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PACKED">Packed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancel order</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
