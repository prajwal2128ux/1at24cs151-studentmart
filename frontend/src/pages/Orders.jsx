import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  Calendar,
  ArrowRight,
  FileText,
  Download,
  CheckCircle2,
  MapPin
} from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import OrderInvoiceModal from "../components/OrderInvoiceModal";
import { buildInvoiceData, downloadInvoicePdf, getInvoiceNumber } from "../utils/invoice";

export function MyOrders() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const placedId = searchParams.get("placed");
  const statePlacedOrder = location.state?.placedOrder || null;

  useEffect(() => {
    api.get("/orders/mine")
      .then(r => setOrders(r.data))
      .catch(e => setError(e.response?.data?.message || "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const placedOrder = useMemo(() => {
    if (!placedId) return null;
    const fromList = orders.find(o => o._id === placedId);
    if (fromList) return fromList;
    if (statePlacedOrder && statePlacedOrder._id === placedId) return statePlacedOrder;
    return null;
  }, [placedId, orders, statePlacedOrder]);

  const placedInvoice = useMemo(
    () => (placedOrder ? buildInvoiceData(placedOrder, user) : null),
    [placedOrder, user]
  );

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
          <p>Track your campus marketplace orders, view receipts, and download invoices.</p>
        </div>
        <Link className="primary-action" to="/shop/products">
          <ShoppingBag size={17} /> Continue Shopping
        </Link>
      </div>

      {/* Order Confirmation Card after successful checkout */}
      {placedOrder && placedInvoice && (
        <section className="order-confirmation-card" aria-label="Order Confirmation">
          <div className="confirmation-head">
            <div className="confirmation-icon-wrap">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <span className="confirmation-eyebrow">ORDER CONFIRMED</span>
              <h2>Thank you, {placedInvoice.customerName}. Your order has been placed.</h2>
              <p>
                Order <strong>{placedInvoice.orderRef}</strong> · Invoice{" "}
                <strong>{placedInvoice.invoiceNumber}</strong> · {placedInvoice.paymentMethod}
              </p>
            </div>
          </div>

          <div className="confirmation-summary-grid">
            <div className="confirmation-meta-item">
              <small>Delivery Address</small>
              <span>
                <MapPin size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                {[
                  placedInvoice.shippingAddress.addressLine,
                  placedInvoice.shippingAddress.city,
                  placedInvoice.shippingAddress.state,
                  placedInvoice.shippingAddress.pincode
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
            <div className="confirmation-meta-item">
              <small>Order Total (COD)</small>
              <strong>₹{placedInvoice.totalAmount.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div className="order-invoice-actions">
            <button
              type="button"
              className="invoice-btn primary"
              onClick={() => setSelectedInvoiceOrder(placedOrder)}
            >
              <FileText size={15} />
              <span>View Invoice</span>
            </button>
            <button
              type="button"
              className="invoice-btn secondary"
              onClick={() => downloadInvoicePdf(placedOrder, user)}
            >
              <Download size={15} />
              <span>Download Invoice (PDF)</span>
            </button>
          </div>
        </section>
      )}

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
          {orders.map(o => {
            const st = (o.orderStatus || o.status || "PLACED").toUpperCase();
            const invoiceNo = getInvoiceNumber(o);
            const orderRef = o.orderId || `#${o._id.slice(-8).toUpperCase()}`;
            return (
              <article className="order-card" key={o._id}>
                <div className="order-card-head">
                  <div>
                    <strong>Order {orderRef}</strong>
                    <span className="order-invoice-ref">Invoice {invoiceNo}</span>
                  </div>
                  <span className={`role-pill status-${st.toLowerCase()}`}>
                    {st}
                  </span>
                </div>

                <p className="order-meta-line">
                  <Calendar size={13} /> {formatDate(o.createdAt)} ·{" "}
                  <span>{o.paymentMethod || "Cash on Delivery"}</span>
                </p>

                <div className="order-items-box">
                  {o.items.map((i, n) => (
                    <div className="order-line" key={n}>
                      <span>{i.name || i.title} × {i.quantity}</span>
                      <strong>₹{(i.price * i.quantity).toLocaleString("en-IN")}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-card-foot">
                  <div>
                    <small className="order-foot-label">Payment on Delivery</small>
                    <strong>₹{o.totalAmount.toLocaleString("en-IN")}</strong>
                  </div>

                  <div className="order-invoice-actions">
                    <button
                      type="button"
                      className="invoice-btn secondary"
                      onClick={() => setSelectedInvoiceOrder(o)}
                    >
                      <FileText size={14} />
                      <span>View Invoice</span>
                    </button>
                    <button
                      type="button"
                      className="invoice-btn primary"
                      onClick={() => downloadInvoicePdf(o, user)}
                    >
                      <Download size={14} />
                      <span>Download Invoice (PDF)</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          user={user}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
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
      setError("");
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
          {orders.map(o => {
            const currentStatus = (o.orderStatus || o.status || "PLACED").toUpperCase();
            const customerName = o.user?.name || o.customerName || "Customer";
            const customerEmail = o.user?.email || o.customerEmail || "";

            return (
              <article className="order-card" key={o._id}>
                <div className="order-card-head">
                  <strong>#{o._id.slice(-8).toUpperCase()} · {customerName}</strong>
                  <span className={`role-pill status-${currentStatus.toLowerCase()}`}>
                    {currentStatus}
                  </span>
                </div>

                <p className="order-meta-line">
                  {customerEmail && <span>{customerEmail} • </span>}
                  <span>{formatDate(o.createdAt)}</span>
                </p>

                <div className="order-items-box">
                  {o.items.map((i, n) => (
                    <div className="order-line" key={n}>
                      <span>{i.name || i.title} × {i.quantity}</span>
                      <strong>₹{(i.price * i.quantity).toLocaleString("en-IN")}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-card-foot">
                  <div>
                    <small className="order-foot-label">Total Amount</small>
                    <strong>₹{o.totalAmount.toLocaleString("en-IN")} (COD)</strong>
                  </div>

                  <select
                    value={currentStatus}
                    onChange={e => update(o._id, e.target.value)}
                    disabled={["DELIVERED", "CANCELLED"].includes(currentStatus)}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
