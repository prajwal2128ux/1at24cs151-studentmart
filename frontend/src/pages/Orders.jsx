import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export function MyOrders() {
  const [orders,setOrders] = useState([]);
  const [error,setError] = useState("");
  useEffect(()=>{api.get("/orders/mine").then(r=>setOrders(r.data)).catch(e=>setError(e.response?.data?.message||"Unable to load orders."));},[]);
  return <div className="products-page"><div className="page-heading"><div><span className="page-eyebrow">PURCHASE HISTORY</span><h1>My Orders</h1><p>Track your StudentMart purchases.</p></div><Link className="primary-action" to="/shop/products">Shop Products</Link></div>
    {error&&<div className="form-error">{error}</div>}
    {orders.length===0&&!error?<div className="products-empty"><h3>No orders yet</h3><p>Your placed orders will appear here.</p></div>:<div className="order-list">{orders.map(o=><article className="order-card" key={o._id}><div className="order-card-head"><strong>Order #{o._id.slice(-8).toUpperCase()}</strong><span className={`role-pill status-${(o.orderStatus||"").toLowerCase()}`}>{o.orderStatus}</span></div><p>{new Date(o.createdAt).toLocaleString()}</p>{o.items.map((i,n)=><div className="order-line" key={n}><span>{i.name} × {i.quantity}</span><strong>₹{(i.price*i.quantity).toLocaleString("en-IN")}</strong></div>)}<div className="summary-total"><span>COD total</span><strong>₹{o.totalAmount.toLocaleString("en-IN")}</strong></div></article>)}</div>}
  </div>;
}

export function AdminOrders() {
  const [orders,setOrders] = useState([]);
  const [error,setError] = useState("");
  const load = ()=>api.get("/orders").then(r=>setOrders(r.data)).catch(e=>setError(e.response?.data?.message||"Unable to load orders."));
  useEffect(()=>{load();},[]);
  const update = async (id,orderStatus)=>{try{await api.patch(`/orders/${id}/status`,{orderStatus});load();}catch(e){setError(e.response?.data?.message||"Update failed.");}};
  return <div className="products-page"><div className="page-heading"><div><span className="page-eyebrow">ADMINISTRATION</span><h1>Customer Orders</h1><p>Review and update customer orders.</p></div></div>{error&&<div className="form-error">{error}</div>}
    <div className="order-list">{orders.map(o=><article className="order-card" key={o._id}><div className="order-card-head"><strong>#{o._id.slice(-8).toUpperCase()} · {o.user?.name||"Customer"}</strong><span className={`role-pill status-${(o.orderStatus||"").toLowerCase()}`}>{o.orderStatus}</span></div><p>{o.user?.email} · {new Date(o.createdAt).toLocaleString()}</p>{o.items.map((i,n)=><div className="order-line" key={n}><span>{i.name} × {i.quantity}</span><strong>₹{(i.price*i.quantity).toLocaleString("en-IN")}</strong></div>)}<div className="order-card-foot"><strong>₹{o.totalAmount.toLocaleString("en-IN")} · COD</strong><select value={o.orderStatus} onChange={e=>update(o._id,e.target.value)} disabled={["DELIVERED","CANCELLED"].includes(o.orderStatus)}><option value="PLACED">Placed</option><option value="CONFIRMED">Confirmed</option><option value="PACKED">Packed</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancel order</option></select></div></article>)}</div>
  </div>;
}