import { jsPDF } from "jspdf";

export function formatInvoiceDate(dateValue) {
  if (!dateValue) return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return String(dateValue);
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInvoiceNumber(order) {
  if (order?.invoiceNumber) return order.invoiceNumber;
  const dateObj = order?.createdAt ? new Date(order.createdAt) : new Date();
  const ym = Number.isNaN(dateObj.getTime())
    ? String(new Date().getFullYear())
    : `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
  const suffix = String(order?._id || order?.orderId || "000000")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-6)
    .toUpperCase();
  return `INV-${ym}-${suffix || "ORDER"}`;
}

export function buildInvoiceData(order, fallbackUser = null) {
  const addr = order?.shippingAddress || {};
  const rawPayment = String(order?.paymentMethod || "Cash on Delivery").trim();
  const paymentMethod =
    rawPayment.toUpperCase() === "COD" ? "Cash on Delivery (COD)" : rawPayment;

  const items = (Array.isArray(order?.items) ? order.items : []).map((item, idx) => {
    const qty = Math.max(1, Number(item.quantity || 1));
    const unitPrice = Number(item.price || 0);
    return {
      index: idx + 1,
      name: item.name || item.title || "Campus Item",
      category: item.category || "",
      quantity: qty,
      unitPrice,
      lineTotal: unitPrice * qty,
    };
  });

  const computedSubtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalAmount = Number(order?.totalAmount ?? computedSubtotal);

  return {
    invoiceNumber: getInvoiceNumber(order),
    orderRef: order?.orderId || `#${String(order?._id || "").slice(-8).toUpperCase()}`,
    mongoId: order?._id || "",
    orderDate: formatInvoiceDate(order?.createdAt),
    status: String(order?.orderStatus || order?.status || "PLACED").toUpperCase(),
    paymentMethod,
    paymentStatus: String(order?.paymentStatus || "PENDING").toUpperCase(),
    customerName:
      addr.fullName ||
      order?.customerName ||
      order?.user?.name ||
      fallbackUser?.name ||
      "Customer",
    customerEmail:
      order?.customerEmail || order?.user?.email || fallbackUser?.email || "",
    customerPhone: addr.phone || order?.customerPhone || "",
    shippingAddress: {
      addressLine: addr.addressLine || order?.deliveryLocation || "Campus Pickup",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    },
    items,
    subtotal: computedSubtotal || totalAmount,
    totalAmount,
  };
}

function formatPdfRs(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function downloadInvoicePdf(order, fallbackUser = null) {
  const inv = buildInvoiceData(order, fallbackUser);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  let y = 48;

  // Brand Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(29, 29, 31);
  doc.text("StudentMart", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(81, 81, 84);
  doc.text("Campus Marketplace | Verified Student Peer Commerce", margin, y + 16);
  doc.text("Dept. of CS&E Campus Hub | Support: prajwalnayak120@gmail.com", margin, y + 30);

  // Invoice Title & Metadata Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(29, 29, 31);
  doc.text("ORDER INVOICE", pageWidth - margin, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(81, 81, 84);
  doc.text(`Invoice No: ${inv.invoiceNumber}`, pageWidth - margin, y + 16, { align: "right" });
  doc.text(`Order ID: ${inv.orderRef}`, pageWidth - margin, y + 30, { align: "right" });
  doc.text(`Order Date: ${inv.orderDate}`, pageWidth - margin, y + 44, { align: "right" });

  y += 62;
  doc.setDrawColor(229, 229, 234);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  // Two-column Billing / Delivery & Payment Info
  const colMid = margin + contentWidth * 0.56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(134, 134, 139);
  doc.text("DELIVER TO", margin, y);
  doc.text("PAYMENT & ORDER SUMMARY", colMid, y);
  y += 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(29, 29, 31);
  doc.text(inv.customerName, margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(81, 81, 84);
  doc.text(`Payment Method: ${inv.paymentMethod}`, colMid, y);

  let leftY = y + 15;
  const addrLines = doc.splitTextToSize(inv.shippingAddress.addressLine, contentWidth * 0.5);
  doc.text(addrLines, margin, leftY);
  leftY += addrLines.length * 13;

  const cityStatePin = [
    inv.shippingAddress.city,
    inv.shippingAddress.state,
    inv.shippingAddress.pincode ? `- ${inv.shippingAddress.pincode}` : "",
  ]
    .filter(Boolean)
    .join(", ")
    .replace(", -", " -");
  if (cityStatePin) {
    doc.text(cityStatePin, margin, leftY);
    leftY += 13;
  }
  if (inv.customerPhone) {
    doc.text(`Phone: ${inv.customerPhone}`, margin, leftY);
    leftY += 13;
  }
  if (inv.customerEmail) {
    doc.text(`Email: ${inv.customerEmail}`, margin, leftY);
    leftY += 13;
  }

  let rightY = y + 15;
  doc.text(`Order Status: ${inv.status}`, colMid, rightY);
  rightY += 14;
  doc.text(`Payment Status: ${inv.paymentStatus === "PAID" ? "Paid" : "Pay on Delivery"}`, colMid, rightY);
  rightY += 14;

  y = Math.max(leftY, rightY) + 18;

  // Itemized Table Header
  doc.setFillColor(29, 29, 31);
  doc.rect(margin, y, contentWidth, 24, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text("#", margin + 10, y + 16);
  doc.text("Item Description", margin + 36, y + 16);
  doc.text("Qty", margin + contentWidth * 0.63, y + 16, { align: "right" });
  doc.text("Unit Price", margin + contentWidth * 0.8, y + 16, { align: "right" });
  doc.text("Amount", pageWidth - margin - 10, y + 16, { align: "right" });

  y += 24;

  // Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  inv.items.forEach((item, index) => {
    const nameLines = doc.splitTextToSize(item.name, contentWidth * 0.5);
    const rowHeight = Math.max(26, nameLines.length * 13 + 12);

    if (y + rowHeight > 740) {
      doc.addPage();
      y = 48;
    }

    if (index % 2 === 1) {
      doc.setFillColor(245, 245, 247);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    doc.setTextColor(29, 29, 31);
    doc.text(String(item.index), margin + 10, y + 16);
    doc.text(nameLines, margin + 36, y + 16);
    doc.text(String(item.quantity), margin + contentWidth * 0.63, y + 16, { align: "right" });
    doc.text(formatPdfRs(item.unitPrice), margin + contentWidth * 0.8, y + 16, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(formatPdfRs(item.lineTotal), pageWidth - margin - 10, y + 16, { align: "right" });
    doc.setFont("helvetica", "normal");

    doc.setDrawColor(229, 229, 234);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
    y += rowHeight;
  });

  y += 18;

  // Totals Summary Box
  const summaryLeft = margin + contentWidth * 0.55;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(81, 81, 84);
  doc.text("Items Subtotal", summaryLeft, y);
  doc.text(formatPdfRs(inv.subtotal), pageWidth - margin - 10, y, { align: "right" });
  y += 18;

  doc.text("Campus Handover / Delivery", summaryLeft, y);
  doc.text("FREE", pageWidth - margin - 10, y, { align: "right" });
  y += 14;

  doc.setDrawColor(210, 210, 215);
  doc.line(summaryLeft, y, pageWidth - margin, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(29, 29, 31);
  doc.text("Grand Total", summaryLeft, y);
  doc.text(formatPdfRs(inv.totalAmount), pageWidth - margin - 10, y, { align: "right" });

  // Footer Note
  y += 42;
  doc.setDrawColor(229, 229, 234);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text(
    "This is a computer-generated StudentMart invoice. Please inspect items at campus handover before completing Cash on Delivery payment.",
    margin,
    y,
    { maxWidth: contentWidth }
  );

  doc.save(`StudentMart-Invoice-${inv.invoiceNumber}.pdf`);
}
