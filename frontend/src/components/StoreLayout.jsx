import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, ClipboardList, UserRound, Settings, LogOut, Store, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const admin = user?.role === "admin";

  const links = admin ? [
    ["/admin", "Dashboard", LayoutDashboard],
    ["/admin/products", "Products", Package],
    ["/admin/orders", "Orders", ClipboardList],
    ["/admin/users", "Customers", Users],
  ] : [
    ["/shop", "Dashboard", LayoutDashboard],
    ["/shop/products", "Browse Products", Package],
    ["/shop/cart", `Shopping Cart (${cartCount})`, ShoppingCart],
    ["/shop/orders", "My Orders", ClipboardList],
  ];

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Store size={27}/></div>
          <div className="brand-details"><h2>StudentMart</h2><span>Campus Marketplace</span></div>
        </div>
        <p className="menu-heading">MAIN MENU</p>
        <nav className="nav-menu">
          {links.map(([to, label, Icon]) => <NavLink key={to} to={to} end className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}>
            <Icon size={19}/><span>{label}</span>
          </NavLink>)}
          <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}><UserRound size={19}/><span>My Profile</span></NavLink>
          {admin && <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}><Settings size={19}/><span>Settings</span></NavLink>}
        </nav>
        <div className="sidebar-support">
          <h3>{admin ? "Administrator" : "Welcome to StudentMart"}</h3>
          <p>{user?.name}<br/>{user?.email}</p>
          <span className="role-pill">{user?.role?.toUpperCase()}</span>
        </div>
        <button className="sidebar-logout" onClick={signOut}><LogOut size={19}/><span>Logout</span></button>
      </aside>
      <main className="main-content">
        <header className="top-navbar">
          <div className="breadcrumb"><span>StudentMart</span><span>/</span><strong>{admin ? "Admin Portal" : "Marketplace"}</strong></div>
          <div className="navbar-right"><div className="navbar-user"><div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div><div className="user-details"><strong>{user?.name}</strong><span>{admin ? "Administrator" : "Student"}</span></div></div></div>
        </header>
        <div className="page-content"><Outlet/></div>
      </main>
    </div>
  );
}