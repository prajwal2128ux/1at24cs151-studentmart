
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../context/ProductContext";

export default function Cart() {
  const { cartItems, cartCount, cartTotal, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();
  const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="cart-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">YOUR MARKETPLACE</span>
          <h1>Shopping Cart</h1>
          <p>Review your selected products.</p>
        </div>
        <Link to="/products" className="back-button"><ArrowLeft size={17}/> Continue Shopping</Link>
      </div>

      {!cartItems.length ? (
        <div className="cart-empty">
          <div className="cart-empty-icon"><ShoppingCart size={38}/></div>
          <h2>Your cart is empty</h2>
          <p>Add products from the Products page.</p>
          <Link to="/products" className="primary-action"><Package size={17}/> Browse Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-panel">
            <div className="cart-panel-heading"><h2>Cart Items</h2><span>{cartCount} items</span></div>
            {cartItems.map(item => (
              <div className="cart-item" key={item._id}>
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
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                ) : <div className="cart-item-placeholder"><Package size={25}/></div>}
                <div className="cart-item-details">
                  <span>{item.category}</span>
                  <h3>{item.name || item.title}</h3>
                  <strong>{money(item.price)}</strong>
                  <div className="quantity-control">
                    <button onClick={() => decreaseQuantity(item._id)} aria-label="Decrease"><Minus size={15}/></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item._id)} disabled={item.quantity >= Number(item.stock)} aria-label="Increase"><Plus size={15}/></button>
                  </div>
                </div>
                <div className="cart-item-end">
                  <strong>{money(item.price * item.quantity)}</strong>
                  <button className="remove-cart-item" onClick={() => removeFromCart(item._id)}><Trash2 size={16}/> Remove</button>
                </div>
              </div>
            ))}
            <button className="clear-cart-button" onClick={() => {
              if (window.confirm("Clear all cart items?")) clearCart();
            }}>Clear Cart</button>
          </section>

          <aside className="cart-summary-panel">
            <h2>Order Summary</h2>
            <div className="summary-line"><span>Total Items</span><strong>{cartCount}</strong></div>
            <div className="summary-line"><span>Subtotal</span><strong>{money(cartTotal)}</strong></div>
            <div className="summary-line"><span>Delivery</span><strong>Free</strong></div>
            <div className="summary-total"><span>Total</span><strong>{money(cartTotal)}</strong></div>
            <button className="checkout-button" onClick={() => alert("Checkout and payment are not implemented yet.")}>Proceed to Checkout</button>
            <p className="checkout-note">Checkout and payment are not connected yet.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
