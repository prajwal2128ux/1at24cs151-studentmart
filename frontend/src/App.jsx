import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import StoreLayout from "./components/StoreLayout";
import { Login, Register } from "./pages/AuthPages";
import { AdminDashboard, AdminProducts, AdminUsers } from "./pages/AdminPages";
import ProductForm from "./pages/ProductForm";
import { ShopDashboard, ShopProducts } from "./pages/Marketplace";
import { CartPage, CheckoutPage } from "./pages/CartCheckout";
import { AdminOrders, MyOrders } from "./pages/Orders";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { useAuth } from "./context/AuthContext";

function HomeRedirect() {
  const {user,authLoading}=useAuth();
  if(authLoading)return <div className="page-loading">Loading StudentMart...</div>;
  return <Navigate to={user?(user.role==="admin"?"/admin":"/shop"):"/login"} replace/>;
}

export default function App(){
  return <Routes>
    <Route path="/" element={<HomeRedirect/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route element={<StoreLayout/>}>
        <Route path="/profile" element={<Profile/>}/>
      </Route>
    </Route>
    <Route element={<ProtectedRoute role="admin"/>}>
      <Route element={<StoreLayout/>}>
        <Route path="/admin" element={<AdminDashboard/>}/>
        <Route path="/admin/products" element={<AdminProducts/>}/>
        <Route path="/admin/products/add" element={<ProductForm/>}/>
        <Route path="/admin/products/edit/:id" element={<ProductForm editing/>}/>
        <Route path="/admin/orders" element={<AdminOrders/>}/>
        <Route path="/admin/users" element={<AdminUsers/>}/>
        <Route path="/settings" element={<Settings/>}/>
      </Route>
    </Route>
    <Route element={<ProtectedRoute role="user"/>}>
      <Route element={<StoreLayout/>}>
        <Route path="/shop" element={<ShopDashboard/>}/>
        <Route path="/shop/products" element={<ShopProducts/>}/>
        <Route path="/shop/cart" element={<CartPage/>}/>
        <Route path="/shop/checkout" element={<CheckoutPage/>}/>
        <Route path="/shop/orders" element={<MyOrders/>}/>
      </Route>
    </Route>
    <Route path="*" element={<HomeRedirect/>}/>
  </Routes>;
}