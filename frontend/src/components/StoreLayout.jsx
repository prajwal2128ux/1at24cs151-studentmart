import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  Store, ShoppingCart, Package, ClipboardList, 
  Users, Settings, UserRound, LogOut, LayoutDashboard,
  Menu, X, Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const admin = user?.role === "admin";

  const links = admin ? [
    ["/admin", "Dashboard", LayoutDashboard],
    ["/admin/products", "Inventory", Package],
    ["/admin/orders", "Orders", ClipboardList],
    ["/admin/users", "Customers", Users],
    ["/settings", "Settings", Settings],
  ] : [
    ["/shop", "Marketplace", LayoutDashboard],
    ["/shop/products", "Explore Products", Package],
    ["/shop/orders", "My Orders", ClipboardList],
  ];

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="marketplace-app">
      {/* Top Utility Bar */}
      <div className="top-utility-bar">
        <div className="utility-inner">
          <span className="utility-tag">
            <Sparkles size={13} /> Campus Marketplace
          </span>
          <span className="utility-info">
            Fast Handover • Zero Commission • Cash on Delivery
          </span>
          <span className="utility-status">
            <span className="status-dot"></span> Live Network
          </span>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="main-header">
        <div className="header-container">
          {/* Brand Logo */}
          <NavLink to={admin ? "/admin" : "/shop"} className="brand-logo">
            <div className="logo-symbol">
              <Store size={22} />
            </div>
            <div className="logo-text">
              <span className="logo-title">StudentMart</span>
              <span className="logo-badge">{admin ? "ADMIN CONSOLE" : "CAMPUS COMMERCE"}</span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            {links.map(([to, label, Icon]) => (
              <NavLink 
                key={to} 
                to={to} 
                end={to === "/admin" || to === "/shop"} 
                className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="header-actions">
            {!admin && (
              <NavLink to="/shop/cart" className="cart-action-btn" title="View Cart">
                <ShoppingCart size={18} />
                <span className="cart-btn-label">Cart</span>
                {cartCount > 0 && (
                  <span className="cart-badge-pill">{cartCount}</span>
                )}
              </NavLink>
            )}

            {/* User Profile Chip */}
            <NavLink to="/profile" className="user-profile-chip" title="My Profile">
              <div className="user-avatar-circle">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="user-info-text">
                <span className="user-name-label">{user?.name}</span>
                <span className="user-role-tag">{admin ? "Administrator" : "Student"}</span>
              </div>
            </NavLink>

            {/* Logout Button */}
            <button className="header-logout-btn" onClick={signOut} title="Sign Out">
              <LogOut size={16} />
              <span className="logout-text">Exit</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-nav-links">
              {links.map(([to, label, Icon]) => (
                <NavLink 
                  key={to} 
                  to={to} 
                  end={to === "/admin" || to === "/shop"} 
                  className={({isActive}) => `mobile-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
              {!admin && (
                <NavLink 
                  to="/shop/cart" 
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart size={18} />
                  <span>Shopping Cart ({cartCount})</span>
                </NavLink>
              )}
              <NavLink 
                to="/profile" 
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserRound size={18} />
                <span>My Profile</span>
              </NavLink>
              <button className="mobile-logout-btn" onClick={signOut}>
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="marketplace-canvas">
        <Outlet />
      </main>

      {/* Modern Marketplace Footer */}
      <footer className="marketplace-footer">
        <div className="footer-container">
          <div className="footer-brand-section">
            <div className="footer-logo">
              <Store size={22} />
              <span>StudentMart</span>
            </div>
            <p>The trusted peer-to-peer campus marketplace designed for students to buy and sell textbooks, electronics, and essentials safely.</p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Quick Links</h4>
              <NavLink to={admin ? "/admin" : "/shop"}>Dashboard</NavLink>
              <NavLink to={admin ? "/admin/products" : "/shop/products"}>{admin ? "Inventory" : "Explore Products"}</NavLink>
              <NavLink to={admin ? "/admin/orders" : "/shop/orders"}>{admin ? "All Orders" : "My Orders"}</NavLink>
              {!admin && <NavLink to="/shop/cart">Shopping Cart</NavLink>}
            </div>
            <div className="footer-col">
              <h4>My Account</h4>
              <NavLink to="/profile">Profile Settings</NavLink>
              {admin && <NavLink to="/settings">Store Settings</NavLink>}
              <button onClick={signOut} className="footer-link-btn">Sign Out</button>
            </div>
            <div className="footer-col">
              <h4>Campus Trust</h4>
              <span>✓ Verified College Members</span>
              <span>✓ Safe Campus Pickup</span>
              <span>✓ Cash on Delivery Guaranteed</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <span>© {new Date().getFullYear()} StudentMart • Campus Commerce Simplified.</span>
          <span>Designed with high security & seamless usability.</span>
        </div>
      </footer>
    </div>
  );
}
