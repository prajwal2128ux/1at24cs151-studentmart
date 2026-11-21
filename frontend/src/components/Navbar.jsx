
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Bell, ChevronDown, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const pageNames = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/add-product": "Add Product",
  "/profile": "My Profile",
  "/cart": "Shopping Cart",
  "/settings": "Settings",
};

export default function Navbar() {
  const location = useLocation();
  const { cartCount } = useCart();

  const currentPage =
    pageNames[location.pathname] ||
    (location.pathname.startsWith("/edit-product/")
      ? "Edit Product"
      : "StudentMart");

  return (
    <header className="top-navbar">
      <div className="breadcrumb">
        <span>Pages</span>
        <span>/</span>
        <strong>{currentPage}</strong>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search"
          />
        </div>

        <Link
          to="/cart"
          className="navbar-cart-link"
          aria-label={`Shopping cart, ${cartCount} items`}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="navbar-cart-count">{cartCount}</span>
          )}
        </Link>

        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
          onClick={() => alert("Notifications are not configured yet.")}
        >
          <Bell size={19} />
        </button>

        <Link to="/profile" className="navbar-user">
          <div className="user-avatar">M</div>
          <div className="user-details">
            <strong>Manohar</strong>
            <span>Student</span>
          </div>
          <ChevronDown size={16} />
        </Link>
      </div>
    </header>
  );
}
