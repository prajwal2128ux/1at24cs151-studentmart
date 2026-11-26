import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown, Package, ChevronRight } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { getProductImageUrl } from "./Marketplace";
import AppleNavbar from "../components/landing/AppleNavbar";
import ScrollIndicator from "../components/landing/ScrollIndicator";
import AboutSection from "../components/landing/AboutSection";
import ContactSection from "../components/landing/ContactSection";
import SupportSection from "../components/landing/SupportSection";
import "../styles/apple-landing.css";

const SHOWCASE_FALLBACK = [
  {
    _id: "showcase-1",
    category: "Books",
    name: "Engineering Textbooks & Notes",
    price: 350,
    isFallback: true,
    description: "Verified peer-shared course books and lab manuals."
  },
  {
    _id: "showcase-2",
    category: "Electronics",
    name: "Calculators & Study Tech",
    price: 899,
    isFallback: true,
    description: "Pre-owned scientific gear, cables, and peripherals."
  },
  {
    _id: "showcase-3",
    category: "Accessories",
    name: "Campus Bags & Lab Essentials",
    price: 499,
    isFallback: true,
    description: "Everyday backpacks, lab coats, and drafting kits."
  }
];

export default function HomePage() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { products } = useProducts();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState(0);

  const featuredItems = products.length > 0 ? products.slice(0, 3) : SHOWCASE_FALLBACK;

  const scrollToSection = (index) => {
    if (!containerRef.current) return;
    const screens = containerRef.current.querySelectorAll(".apple-screen");
    if (screens[index]) {
      screens[index].scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const hashMap = {
      "#hero": 0,
      "#about": 1,
      "#contact": 2,
      "#support": 3,
    };
    if (location.hash && hashMap[location.hash] !== undefined) {
      const targetIndex = hashMap[location.hash];
      setTimeout(() => scrollToSection(targetIndex), 80);
    }
  }, [location.hash]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const screens = container.querySelectorAll(".apple-screen");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(screens).indexOf(entry.target);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.45,
      }
    );

    screens.forEach((screen) => observer.observe(screen));
    return () => {
      screens.forEach((screen) => observer.unobserve(screen));
    };
  }, []);

  const handleNavbarNavigate = (navId) => {
    if (navId === "login") {
      navigate(user ? (user.role === "admin" ? "/admin" : "/shop") : "/login");
      return;
    }
    if (navId === "home") {
      scrollToSection(0);
      return;
    }
    if (navId === "about") {
      scrollToSection(1);
      return;
    }
    if (navId === "contact") {
      scrollToSection(2);
      return;
    }
    if (navId === "support") {
      scrollToSection(3);
    }
  };

  const handleShowcaseClick = (item) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin") {
      navigate("/admin/products");
      return;
    }
    if (item.isFallback) {
      navigate("/shop/products");
    } else {
      navigate(`/shop/products/${item._id}`);
    }
  };

  const resolvedActiveNav =
    activeSection === 0
      ? "home"
      : activeSection === 1
      ? "about"
      : activeSection === 2
      ? "contact"
      : "support";

  return (
    <div ref={containerRef} className="apple-landing-wrapper">
      <AppleNavbar activeNav={resolvedActiveNav} onNavigate={handleNavbarNavigate} />

      <ScrollIndicator
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />

      {/* Screen 1: Apple-Inspired Editorial Storefront Hero */}
      <section id="hero" className="apple-screen apple-hero-screen">
        <div className="apple-home-hero">
          <span className="apple-eyebrow-muted">StudentMart Campus Store</span>

          <h1 className="apple-home-title">
            Everything campus life needs.
            <span> Right on your campus.</span>
          </h1>

          <p className="apple-home-subtitle">
            Buy and sell verified textbooks, electronics, and daily university essentials
            directly with peers. Zero platform fees. Simple Cash on Delivery.
          </p>

          <div className="apple-home-cta-row">
            <button
              type="button"
              className="apple-cta-primary"
              onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/shop") : "/login")}
            >
              <span>{user ? "Open Storefront" : "Sign in to Shop"}</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="apple-cta-link"
              onClick={() => scrollToSection(1)}
            >
              <span>Learn more</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Live Apple Store Product Shelf */}
          <div className="apple-showcase-shelf">
            {featuredItems.map((item) => {
              const imgUrl = getProductImageUrl(item.imageUrl || item.image, item.category);
              const title = item.name || item.title || "Campus Listing";
              return (
                <button
                  key={item._id}
                  type="button"
                  className="apple-shelf-card"
                  onClick={() => handleShowcaseClick(item)}
                >
                  <div className="shelf-card-image">
                    {imgUrl ? (
                      <img src={imgUrl} alt={title} loading="lazy" />
                    ) : (
                      <Package size={36} />
                    )}
                  </div>
                  <div className="shelf-card-meta">
                    <span className="shelf-card-cat">{item.category || "Campus"}</span>
                    <h3>{title}</h3>
                    <div className="shelf-card-foot">
                      <strong>₹{Number(item.price || 0).toLocaleString("en-IN")}</strong>
                      <span className="shelf-card-action">
                        {user ? "View ›" : "Sign in ›"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="apple-scroll-cue"
          onClick={() => scrollToSection(1)}
          role="button"
          tabIndex={0}
        >
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* Screen 2: About Our Project */}
      <AboutSection onNextSection={() => scrollToSection(2)} />

      {/* Screen 3: Contact Details */}
      <ContactSection onNextSection={() => scrollToSection(3)} />

      {/* Screen 4: Customer Care & Support */}
      <SupportSection onScrollToTop={() => scrollToSection(0)} />
    </div>
  );
}
