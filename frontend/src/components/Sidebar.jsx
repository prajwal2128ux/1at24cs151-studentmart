
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  UserRound,
  ShoppingCart,
  Settings,
  LogOut,
  Headset,
  Store,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Sidebar() {
  const { cartCount } = useCart();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package },
    { to: "/add-product", label: "Add Product", icon: PlusCircle },
    { to: "/profile", label: "My Profile", icon: UserRound },
    { to: "/cart", label: "Shopping Cart", icon: ShoppingCart, cart: true },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Store size={27} />
        </div>
        <div className="brand-details">
          <h2>StudentMart</h2>
          <span>Campus Marketplace</span>
        </div>
      </div>

      <div className="sidebar-menu">
        <p className="menu-heading">MAIN MENU</p>

        <nav className="nav-menu">
          {links.map(({ to, label, icon: Icon, cart }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
              {cart && cartCount > 0 && (
                <span className="sidebar-cart-count">{cartCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-support">
        <Headset size={24} className="support-icon" />
        <h3>Need help?</h3>
        <p>Contact our support team if you need assistance.</p>
        <button
          type="button"
          onClick={() =>
            window.location.href = "mailto:support@example.com"
          }
        >
          Contact Support
        </button>
      </div>

      <button
        type="button"
        className="sidebar-logout"
        onClick={() => alert("Authentication is not configured yet.")}
      >
        <LogOut size={19} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
