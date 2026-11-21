import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api, { API_BASE } from "../api";

export function CartPage() {
  const { cartItems, cartCount, cartTotal, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [error,setError] = useState("");
  const navigate = useNavigate();
  if (!cartItems.length) return <div className="cart-page"><div className="cart-empty"><ShoppingCart size={40}/><h2>Your cart is empty</h2><Link className="primary-action" to="/shop/products">Browse Products</Link></div></div>;
  return <div className="cart-page"><div className="page-heading"><div><span className="page-eyebrow">YOUR MARKETPLACE</span><h1>Shopping Cart</h1><p>Review your selected products.</p></div><Link to="/shop/products" className="back-button"><ArrowLeft size={17}/> Continue Shopping</Link></div>
    <div className="cart-layout"><section className="cart-items-panel"><div className="cart-panel-heading"><h2>Cart Items</h2><span>{cartCount} items</span></div>
      {cartItems.map(item=><div className="cart-item" key={item._id}><div className="cart-item-placeholder">{item.imageUrl ? <img src={item.imageUrl.startsWith("http") ? item.imageUrl : `${API_BASE}/${item.imageUrl.replace(/^\/+/, "")}`} alt={item.name}/> : <Package size={28}/>}</div><div className="cart-item-details"><span>{item.category}</span><h3>{item.name}</h3><strong>₹{item.price.toLocaleString("en-IN")}</strong><div className="quantity-control"><button onClick={()=>decreaseQuantity(item._id)}><Minus size={15}/></button><span>{item.quantity}</span><button disabled={item.quantity>=item.stock} onClick={()=>increaseQuantity(item._id)}><Plus size={15}/></button></div></div><div className="cart-item-end"><strong>₹{(item.price*item.quantity).toLocaleString("en-IN")}</strong><button className="remove-cart-item" onClick={()=>removeFromCart(item._id)}><Trash2 size={15}/> Remove</button></div></div>)}
    </section><aside className="cart-summary-panel"><h2>Order Summary</h2><div className="summary-line"><span>Total Items</span><strong>{cartCount}</strong></div><div className="summary-line"><span>Subtotal</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></div><div className="summary-line"><span>Payment</span><strong>Cash on Delivery</strong></div><div className="summary-total"><span>Total</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></div>{error&&<div className="form-error">{error}</div>}<button className="checkout-button" onClick={()=>navigate("/shop/checkout")}>Proceed to Checkout</button></aside></div>
  </div>;
}

export function CheckoutPage() {
  const { cartItems, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address,setAddress] = useState({fullName:user?.name||"",phone:"",addressLine:"",city:"",state:"Karnataka",pincode:""});
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const update = e => setAddress({...address,[e.target.name]:e.target.value});
  const submit = async e => {
    e.preventDefault(); setError("");
    if (!cartItems.length) return setError("Your cart is empty.");
    setBusy(true);
    try {
      const {data} = await api.post("/orders", {
        items: cartItems.map(i=>({productId:i._id,quantity:i.quantity})),
        shippingAddress: address
      });
      clearCart();
      navigate(`/shop/orders?placed=${data._id}`);
    } catch(err) { setError(err.response?.data?.message||"Unable to place order."); }
    finally { setBusy(false); }
  };
  return <div className="form-page"><div className="page-heading"><div><span className="page-eyebrow">CASH ON DELIVERY</span><h1>Delivery Details</h1><p>Enter where your order should be delivered.</p></div></div>
    <form className="product-form" onSubmit={submit}><section className="form-section"><div className="form-section-title"><div className="form-icon"><ShoppingCart/></div><div><h2>Shipping Address</h2><p>All fields are required.</p></div></div><div className="form-grid">
      {[["fullName","Full name"],["phone","Phone number"],["addressLine","Address"],["city","City"],["state","State"],["pincode","PIN code"]].map(([name,label])=><div className="form-field" key={name}><label>{label}</label><input name={name} value={address[name]} onChange={update} required maxLength={name==="addressLine"?200:80}/></div>)}
    </div></section><div className="cart-summary-panel"><h2>Payment: Cash on Delivery</h2><div className="summary-total"><span>Order total</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></div></div>{error&&<div className="form-error">{error}</div>}<div className="form-actions"><button className="save-product-button" disabled={busy||!cartItems.length}>{busy?"Placing order...":"Place COD Order"}</button></div></form>
  </div>;
}