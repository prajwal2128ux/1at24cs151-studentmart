import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Store, ShoppingCart, Package, ClipboardList, 
  Users, Settings, UserRound, LogOut, LayoutDashboard,
  Menu, X, Sparkles, ChevronRight, ShieldCheck, HelpCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../api";

function getAvatarUrl(avatar) {
  if (!avatar || typeof avatar !== "string") return "";
  if (avatar.startsWith("data:") || avatar.startsWith("http") || avatar.startsWith("blob:")) return avatar;
  return `${API_BASE}/${avatar.replace(/^\/+/, "")}`;
}

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const admin = user?.role === "admin";

  const navSections = admin ? [
    {
      heading: "STORE MANAGEMENT",
      items: [
        { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/admin/products", label: "Inventory & Products", icon: Package },
        { to: "/admin/orders", label: "Customer Orders", icon: ClipboardList },
      ]
    },
    {
      heading: "DIRECTORY & SYSTEM",
      items: [
        { to: "/admin/users", label: "Customers", icon: Users },
        { to: "/settings", label: "Store Settings", icon: Settings },
        { to: "/profile", label: "Admin Profile", icon: UserRound },
      ]
    }
  ] : [
    {
      heading: "MARKETPLACE",
      items: [
        { to: "/shop", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/shop/products", label: "Explore Catalog", icon: Package },
      ]
    },
    {
      heading: "PURCHASES",
      items: [
        { to: "/shop/cart", label: "Shopping Cart", icon: ShoppingCart, badge: cartCount },
        { to: "/shop/orders", label: "My Orders", icon: ClipboardList },
      ]
    },
    {
      heading: "ACCOUNT",
      items: [
        { to: "/profile", label: "My Profile", icon: UserRound },
      ]
    }
  ];

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === "/shop") return "Student Marketplace";
    if (path === "/shop/products") return "Explore Catalog";
    if (path.startsWith("/shop/products/")) return "Product Details";
    if (path === "/shop/cart") return "Shopping Cart";
    if (path === "/shop/checkout") return "Checkout";
    if (path === "/shop/orders") return "My Orders";
    if (path === "/admin") return "Admin Command Center";
    if (path.startsWith("/admin/products")) return "Inventory Management";
    if (path === "/admin/orders") return "Customer Orders";
    if (path === "/admin/users") return "Customer Directory";
    if (path === "/settings") return "System Settings";
    if (path === "/profile") return "User Profile";
    return "Marketplace";
  };

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Executive Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <NavLink to={admin ? "/admin" : "/shop"} className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
            <div className="brand-logo-icon">
              <Store size={22} />
            </div>
            <div className="brand-info">
              <span className="brand-name">StudentMart</span>
              <span className="brand-tagline">
                {admin ? "ADMIN CONSOLE" : "CAMPUS COMMERCE"}
              </span>
            </div>
          </NavLink>

          <button 
            className="sidebar-close-btn" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="sidebar-nav-container">
          {navSections.map((section, idx) => (
            <div className="sidebar-nav-group" key={idx}>
              <span className="group-heading">{section.heading}</span>
              <nav className="nav-list">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={18} className="item-icon" />
                    <span className="item-label">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="sidebar-badge">{item.badge}</span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Support & Trust Box */}
        <div className="sidebar-trust-box">
          <div className="trust-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong>Verified Campus Network</strong>
            <p>Peer handover with Cash on Delivery</p>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="sidebar-footer">
          <NavLink to="/profile" className="user-profile-tile" onClick={() => setSidebarOpen(false)}>
            <div className="user-avatar-badge">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user.name}
                  className="avatar-img-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div className="user-text-meta">
              <strong className="user-full-name">{user?.name || "Student"}</strong>
              <span className="user-email-text">{user?.email}</span>
            </div>
          </NavLink>

          <button className="sidebar-signout-btn" onClick={signOut} title="Sign Out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="app-viewport">
        {/* Top Sticky Navbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button 
              className="topbar-menu-btn" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            <div className="topbar-breadcrumbs">
              <span className="crumb-root">StudentMart</span>
              <ChevronRight size={14} className="crumb-sep" />
              <span className="crumb-active">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="topbar-right">
            {!admin && (
              <NavLink to="/shop/cart" className="topbar-cart-btn" title="View Shopping Cart">
                <ShoppingCart size={18} />
                <span className="cart-label-text">Cart</span>
                {cartCount > 0 && (
                  <span className="topbar-cart-badge">{cartCount}</span>
                )}
              </NavLink>
            )}

            <div className="topbar-status-chip">
              <span className="status-live-dot" />
              <span>Campus Live</span>
            </div>

            <NavLink to="/profile" className="topbar-user-chip" title="My Account">
              <div className="chip-avatar">
                {user?.avatar ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.name}
                    className="avatar-img-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  user?.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <span className="chip-name">{user?.name}</span>
            </NavLink>
          </div>
        </header>

        {/* Dynamic Page Canvas */}
        <main className="app-canvas">
          <Outlet />
        </main>

        {/* Integrated Footer */}
        <footer className="canvas-footer">
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-brand">
                <Store size={18} />
                <span>StudentMart</span>
              </div>
              <p>The student-first campus marketplace. Safe, fast peer-to-peer commerce.</p>
            </div>
            <div className="footer-right">
              <div className="footer-trust-pills">
                <span>✓ Verified Students</span>
                <span>✓ Zero Commission</span>
                <span>✓ Cash on Delivery</span>
              </div>
              <span className="footer-copy">© {new Date().getFullYear()} StudentMart • Built for campus life</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
