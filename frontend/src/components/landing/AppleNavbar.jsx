import React, { useState } from "react";
import { Store, Menu, X } from "lucide-react";

export default function AppleNavbar({ activeNav, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "login", label: "Login" },
    { id: "about", label: "About Project" },
    { id: "contact", label: "Contact" },
    { id: "support", label: "Customer Care" },
  ];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="apple-sticky-nav">
      <div className="apple-sticky-nav-inner">
        {/* Brand / Logo */}
        <button
          type="button"
          className="apple-sticky-brand"
          onClick={() => handleNavClick("home")}
          aria-label="StudentMart Home"
        >
          <span className="apple-sticky-logo">
            <Store size={18} />
          </span>
          <span className="apple-sticky-wordmark">StudentMart</span>
        </button>

        {/* Desktop Links */}
        <nav className="apple-sticky-links" aria-label="Primary Navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`apple-sticky-link ${activeNav === item.id ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Status & Mobile Menu Toggle */}
        <div className="apple-sticky-actions">
          <div className="apple-nav-status">
            <span className="live-indicator" />
            <span>Campus Live</span>
          </div>

          <button
            type="button"
            className="apple-mobile-menu-btn"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="apple-mobile-drawer" aria-label="Mobile Navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`apple-mobile-link ${activeNav === item.id ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
