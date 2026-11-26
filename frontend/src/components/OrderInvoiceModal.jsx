import React from "react";
import { Download, Printer, Store, X } from "lucide-react";
import { buildInvoiceData, downloadInvoicePdf } from "../utils/invoice";

export default function OrderInvoiceModal({ order, user, onClose }) {
  if (!order) return null;
  const inv = buildInvoiceData(order, user);

  const cityStatePin = [
    inv.shippingAddress.city,
    inv.shippingAddress.state,
    inv.shippingAddress.pincode ? `— ${inv.shippingAddress.pincode}` : "",
  ]
    .filter(Boolean)
    .join(", ")
    .replace(", —", " —");

  return (
    <div className="invoice-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Invoice ${inv.invoiceNumber}`}>
      <div className="invoice-modal-shell">
        {/* Action Bar (hidden when printing) */}
        <div className="invoice-toolbar no-print">
          <div className="invoice-toolbar-title">
            <strong>Invoice {inv.invoiceNumber}</strong>
            <span>Order {inv.orderRef}</span>
          </div>

          <div className="invoice-toolbar-actions">
            <button
              type="button"
              className="invoice-tool-btn primary"
              onClick={() => downloadInvoicePdf(order, user)}
            >
              <Download size={15} />
              <span>Download Invoice (PDF)</span>
            </button>

            <button
              type="button"
              className="invoice-tool-btn"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              type="button"
              className="invoice-close-btn"
              onClick={onClose}
              aria-label="Close invoice"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="invoice-sheet" id="printable-invoice">
          <header className="invoice-sheet-header">
            <div className="invoice-brand-block">
              <div className="invoice-brand-row">
                <span className="invoice-logo-box">
                  <Store size={18} />
                </span>
                <div>
                  <h2>StudentMart</h2>
                  <p>Campus Marketplace · Verified Peer Commerce</p>
                </div>
              </div>
              <small>Dept. of CS&amp;E Campus Hub · Support: prajwalnayak120@gmail.com</small>
            </div>

            <div className="invoice-meta-block">
              <span className="invoice-doc-type">ORDER INVOICE</span>
              <div><strong>Invoice No:</strong> {inv.invoiceNumber}</div>
              <div><strong>Order ID:</strong> {inv.orderRef}</div>
              <div><strong>Order Date:</strong> {inv.orderDate}</div>
            </div>
          </header>

          <section className="invoice-parties-grid">
            <div className="invoice-info-box">
              <span className="invoice-section-label">DELIVER TO</span>
              <strong>{inv.customerName}</strong>
              <p>{inv.shippingAddress.addressLine}</p>
              {cityStatePin && <p>{cityStatePin}</p>}
              {inv.customerPhone && <p>Phone: {inv.customerPhone}</p>}
              {inv.customerEmail && <p>Email: {inv.customerEmail}</p>}
            </div>

            <div className="invoice-info-box">
              <span className="invoice-section-label">PAYMENT &amp; FULFILLMENT</span>
              <div className="invoice-kv">
                <span>Payment Method</span>
                <strong>{inv.paymentMethod}</strong>
              </div>
              <div className="invoice-kv">
                <span>Payment Status</span>
                <strong>{inv.paymentStatus === "PAID" ? "Paid" : "Cash on Delivery"}</strong>
              </div>
              <div className="invoice-kv">
                <span>Order Status</span>
                <strong>{inv.status}</strong>
              </div>
            </div>
          </section>

          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th className="num">Qty</th>
                  <th className="num">Unit Price</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item) => (
                  <tr key={item.index}>
                    <td>{item.index}</td>
                    <td>
                      <strong>{item.name}</strong>
                      {item.category && <span className="invoice-item-cat">{item.category}</span>}
                    </td>
                    <td className="num">{item.quantity}</td>
                    <td className="num">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                    <td className="num"><strong>₹{item.lineTotal.toLocaleString("en-IN")}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-totals-row">
            <div className="invoice-totals-box">
              <div className="invoice-total-line">
                <span>Subtotal</span>
                <span>₹{inv.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="invoice-total-line">
                <span>Campus Handover</span>
                <span>FREE</span>
              </div>
              <div className="invoice-total-grand">
                <span>Grand Total</span>
                <strong>₹{inv.totalAmount.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>

          <footer className="invoice-sheet-footer">
            <p>
              This is a computer-generated StudentMart invoice. Please verify items during campus
              handover prior to completing Cash on Delivery payment.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
