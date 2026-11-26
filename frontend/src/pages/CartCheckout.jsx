import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus, Plus, Trash2, ArrowLeft, ShoppingCart, Package,
  ShieldCheck, MapPin, Truck, Loader2, CheckCircle2, AlertCircle, ExternalLink
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api, { API_BASE } from "../api";

export function CartPage() {
  const { cartItems, cartCount, cartTotal, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!cartItems.length) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <ShoppingCart size={48} />
          <h2>Your shopping cart is empty</h2>
          <p>Discover textbooks, stationery, gadgets, and dorm essentials listed by fellow students.</p>
          <Link className="primary-action" to="/shop/products" style={{ marginTop: "16px" }}>
            Explore Campus Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">YOUR SELECTIONS</span>
          <h1>Shopping Cart</h1>
          <p>Review items in your cart before proceeding to checkout.</p>
        </div>
        <Link to="/shop/products" className="back-button">
          <ArrowLeft size={17} /> Continue Browsing
        </Link>
      </div>

      <div className="cart-layout">
        <section className="cart-items-panel">
          <div className="cart-panel-heading">
            <h2>Selected Items ({cartCount})</h2>
            <span>Verified Campus Listings</span>
          </div>

          {cartItems.map(item => (
            <div className="cart-item" key={item._id}>
              <div className="cart-item-placeholder cart-item-image-wrap">
                {item.imageUrl || item.image ? (
                  <img
                    className="cart-item-img"
                    src={
                      (item.imageUrl || item.image).startsWith("data:") ||
                      (item.imageUrl || item.image).startsWith("http")
                        ? (item.imageUrl || item.image)
                        : `${API_BASE}/${(item.imageUrl || item.image).replace(/^\/+/, "")}`
                    }
                    alt={item.name || item.title}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <Package size={30} />
                )}
              </div>

              <div className="cart-item-details">
                <span>{item.category}</span>
                <h3>{item.name || item.title}</h3>
                <strong>₹{Number(item.price).toLocaleString("en-IN")} each</strong>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item._id)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.stock}
                    onClick={() => increaseQuantity(item._id)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="cart-item-end">
                <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                <button
                  type="button"
                  className="remove-cart-item"
                  onClick={() => removeFromCart(item._id)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </section>

        <aside className="cart-summary-panel">
          <h2>Order Summary</h2>
          <div className="summary-line">
            <span>Total Items</span>
            <strong>{cartCount} items</strong>
          </div>
          <div className="summary-line">
            <span>Item Subtotal</span>
            <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
          </div>
          <div className="summary-line">
            <span>Campus Handover</span>
            <strong style={{ color: "var(--success)" }}>FREE (Peer Pickup)</strong>
          </div>
          <div className="summary-line">
            <span>Payment Method</span>
            <strong>Cash on Delivery</strong>
          </div>

          <div className="summary-total">
            <span>Grand Total</span>
            <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="button"
            className="checkout-button"
            onClick={() => navigate("/shop/checkout")}
          >
            Proceed to Checkout
          </button>

          <div style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "8px",
            background: "var(--bg-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11.5px",
            color: "var(--text-secondary)"
          }}>
            <ShieldCheck size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
            <span>Pay in cash when you inspect the item on campus.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const { cartItems, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine: "",
    city: "",
    state: "Karnataka",
    pincode: ""
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [detectedCoords, setDetectedCoords] = useState(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const update = e => setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const detectCurrentLocation = () => {
    setLocationStatus(null);
    setDetectedCoords(null);
    setLocationConfirmed(false);
    if (!navigator.geolocation) {
      setLocationStatus({
        type: "error",
        message: "Geolocation is not supported by your browser. Please enter your address manually."
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDetectedCoords({ lat: latitude, lng: longitude });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
              latitude
            )}&lon=${encodeURIComponent(longitude)}&addressdetails=1&accept-language=en`
          );
          if (!response.ok) {
            throw new Error(`Geocoding service returned status ${response.status}`);
          }

          const data = await response.json();
          const addr = data?.address || {};

          const buildingOrPlace =
            addr.amenity || addr.building || addr.university || addr.college || "";
          const streetPart = [
            addr.house_number,
            addr.road || addr.pedestrian || addr.footway || addr.path
          ]
            .filter(Boolean)
            .join(" ");
          const areaPart =
            addr.neighbourhood ||
            addr.suburb ||
            addr.residential ||
            addr.quarter ||
            addr.city_district ||
            addr.hamlet ||
            "";

          const uniqueParts = [];
          for (const part of [buildingOrPlace, streetPart, areaPart]) {
            const trimmed = String(part || "").trim();
            if (trimmed && !uniqueParts.includes(trimmed)) uniqueParts.push(trimmed);
          }

          let detectedLine = uniqueParts.join(", ");
          if (!detectedLine && data?.display_name) {
            detectedLine = data.display_name.split(",").slice(0, 3).join(",").trim();
          }
          detectedLine = detectedLine.slice(0, 200);

          const detectedCity = String(
            addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.state_district ||
              addr.county ||
              ""
          ).slice(0, 80);

          const detectedState = String(addr.state || addr.region || "").slice(0, 80);
          const detectedPincode = String(addr.postcode || "").trim().slice(0, 80);

          if (!detectedLine && !detectedCity && !detectedState && !detectedPincode) {
            setLocationStatus({
              type: "error",
              message: "Could not resolve an address for your current coordinates. Please enter it manually."
            });
            return;
          }

          setAddress(prev => ({
            ...prev,
            addressLine: detectedLine || prev.addressLine,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
            pincode: detectedPincode || prev.pincode
          }));

          setLocationStatus({
            type: "success",
            message: detectedPincode
              ? "Location detected and address fields filled. You can edit any field below."
              : "Location detected and address filled. Please enter or verify your PIN code."
          });
        } catch {
          setLocationStatus({
            type: "error",
            message: "Unable to fetch address details from OpenStreetMap right now. Please enter your address manually."
          });
        } finally {
          setLocating(false);
        }
      },
      (geoError) => {
        const messages = {
          1: "Location permission denied. Allow location access in your browser settings or enter your address manually.",
          2: "Your current location is unavailable. Please check device GPS/network or enter your address manually.",
          3: "Location request timed out. Please try again or enter your address manually."
        };
        setLocationStatus({
          type: "error",
          message: messages[geoError?.code] || "Unable to detect your location. Please enter your address manually."
        });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const submit = async e => {
    e.preventDefault();
    setError("");
    if (!cartItems.length) return setError("Your cart is empty.");
    setBusy(true);
    try {
      const { data } = await api.post("/orders", {
        items: cartItems.map(i => ({ productId: i._id, quantity: i.quantity })),
        shippingAddress: address
      });
      clearCart();
      navigate(`/shop/orders?placed=${data._id}`, { state: { placedOrder: data } });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to place order.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">FINAL STEP</span>
          <h1>Checkout & Delivery Details</h1>
          <p>Specify your campus hostel or delivery location for peer handover.</p>
        </div>
        <Link to="/shop/cart" className="back-button">
          <ArrowLeft size={16} /> Return to Cart
        </Link>
      </div>

      <form className="product-form" onSubmit={submit}>
        <section className="form-section">
          <div className="form-section-title form-section-title-split">
            <div className="form-section-title-left">
              <div className="form-icon">
                <MapPin size={22} />
              </div>
              <div>
                <h2>Handover & Shipping Address</h2>
                <p>Where you will meet the peer seller or receive the items.</p>
              </div>
            </div>

            <button
              type="button"
              className="location-detect-btn"
              onClick={detectCurrentLocation}
              disabled={locating}
            >
              {locating ? (
                <>
                  <Loader2 size={15} className="spin-icon" />
                  <span>Detecting location...</span>
                </>
              ) : (
                <span>Use My Current Location 📍</span>
              )}
            </button>
          </div>

          {(locationStatus || detectedCoords) && (
            <div
              className={`location-status-banner ${locationStatus?.type || "success"}`}
              role={locationStatus?.type === "error" ? "alert" : "status"}
            >
              <div className="location-status-message">
                {locationStatus?.type === "error" ? (
                  <AlertCircle size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>
                  {locationConfirmed
                    ? "Delivery location confirmed. You can still adjust any address field below."
                    : locationStatus?.message}
                </span>
              </div>

              {detectedCoords && (
                <div className="location-status-actions">
                  <a
                    href={`https://www.google.com/maps?q=${detectedCoords.lat},${detectedCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-map-link"
                  >
                    <ExternalLink size={14} />
                    <span>View Location on Map</span>
                  </a>
                  <button
                    type="button"
                    className={`location-confirm-btn ${locationConfirmed ? "confirmed" : ""}`}
                    onClick={() => setLocationConfirmed(true)}
                    disabled={locationConfirmed}
                  >
                    {locationConfirmed ? "Confirmed ✓" : "Confirm Location"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="form-grid">
            {[
              ["fullName", "Recipient Full Name", "e.g., Prajwal Kumar"],
              ["phone", "Contact Phone Number", "e.g., 9876543210"],
              ["addressLine", "Campus Address / Hostel & Room No.", "e.g., Block B, Room 304, Campus Hostel"],
              ["city", "City", "e.g., Bengaluru"],
              ["state", "State", "e.g., Karnataka"],
              ["pincode", "PIN Code", "e.g., 560001"]
            ].map(([name, label, placeholder]) => (
              <div className={`form-field ${name === "addressLine" ? "full-width" : ""}`} key={name}>
                <label>{label}</label>
                <input
                  name={name}
                  placeholder={placeholder}
                  value={address[name]}
                  onChange={update}
                  required
                  maxLength={name === "addressLine" ? 200 : 80}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="cart-summary-panel">
          <h2>Payment Method: Cash on Delivery (COD)</h2>
          <p style={{ margin: "4px 0 16px", color: "var(--text-secondary)", fontSize: "13px" }}>
            Inspect the product on campus before handing over cash. No online payment required.
          </p>
          <div className="summary-total" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "14px" }}>
            <span>Order Total Amount:</span>
            <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button className="save-product-button" disabled={busy || !cartItems.length}>
            <Truck size={17} />
            {busy ? "Placing your order..." : `Confirm COD Order (₹${cartTotal.toLocaleString("en-IN")})`}
          </button>
        </div>
      </form>
    </div>
  );
}
