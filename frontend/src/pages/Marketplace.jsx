import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Package,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Tag,
  SlidersHorizontal,
  Flame
} from "lucide-react";

import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../api";

export const CATEGORY_FALLBACK_IMAGES = {
  Books: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
  Gadgets: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
  Electronics: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
  "College Bags": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
  Accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
  Uniform: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80",
  Clothing: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
  Stationery: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
  Other: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80"
};

export function getProductImageUrl(imageUrl, category) {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
    return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.Other;
  }

  const image = String(imageUrl).trim();

  if (
    image.startsWith("data:") ||
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${API_BASE}/${image.replace(/^\/+/, "")}`;
}

export function matchesCategoryFilter(productCategory, selectedCategory) {
  if (!selectedCategory || selectedCategory === "All") return true;
  if (productCategory === selectedCategory) return true;
  const pCat = String(productCategory || "").toLowerCase().trim();
  const sCat = String(selectedCategory || "").toLowerCase().trim();
  if (pCat === sCat) return true;
  if (sCat === "electronics" && (pCat === "gadgets" || pCat === "electronics")) return true;
  if (sCat === "gadgets" && (pCat === "gadgets" || pCat === "electronics")) return true;
  if (sCat === "accessories" && (pCat === "college bags" || pCat === "accessories")) return true;
  if (sCat === "college bags" && (pCat === "college bags" || pCat === "accessories")) return true;
  if (sCat === "clothing" && (pCat === "uniform" || pCat === "clothing")) return true;
  if (sCat === "uniform" && (pCat === "uniform" || pCat === "clothing")) return true;
  return false;
}

const DEFAULT_CATEGORIES = [
  "All",
  "Electronics",
  "Books",
  "Stationery",
  "Accessories",
  "Clothing",
  "Other"
];

// ==========================================
// PRODUCT CARD
// ==========================================

export function ProductCard({ product }) {
  const {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity
  } = useCart();

  const primaryImage = product.imageUrl || product.image || "";
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => getProductImageUrl(primaryImage, product.category));
  const [message, setMessage] = useState("");

  useEffect(() => {
    setImageError(false);
    setImageSrc(getProductImageUrl(product.imageUrl || product.image, product.category));
  }, [product.imageUrl, product.image, product.category]);

  const handleImageError = () => {
    const fallback = CATEGORY_FALLBACK_IMAGES[product.category] || CATEGORY_FALLBACK_IMAGES.Other;
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    } else {
      setImageError(true);
    }
  };

  const cartProduct = cartItems.find(
    item => item._id === product._id
  );

  const quantity = cartProduct
    ? Number(cartProduct.quantity)
    : 0;

  const stock = Math.max(0, Number(product.stock || 0));
  const title = product.name || product.title || "Campus Item";
  const description = product.description || product.desc || "Available for campus pickup.";

  const handleAdd = () => {
    try {
      addToCart({
        ...product,
        name: title,
        title,
        description,
        desc: description,
        imageUrl: imageSrc,
        image: imageSrc
      });
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Unable to add product.");
    }
  };

  const handleIncrease = () => {
    if (quantity >= stock) {
      setMessage("Maximum available stock reached.");
      return;
    }

    increaseQuantity(product._id);
    setMessage("");
  };

  const handleDecrease = () => {
    decreaseQuantity(product._id);
    setMessage("");
  };

  return (
    <article className="product-card">
      <Link to={`/shop/products/${product._id}`} className="product-image-wrap">
        {imageSrc && !imageError ? (
          <img
            src={imageSrc}
            alt={title}
            className="product-image"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="product-image-fallback">
            <Package size={44} />
            <span>{product.category || "Campus Item"}</span>
          </div>
        )}

        <span className={`stock-badge ${
          stock > 5
            ? "stock-good"
            : stock > 0
            ? "stock-low"
            : "stock-out"
        }`}>
          {stock > 0 ? `${stock} in stock` : "Sold out"}
        </span>
      </Link>

      <div className="product-card-content">
        <div className="product-meta-row">
          <span className="product-category">
            {product.category}
          </span>
          {stock > 0 && stock <= 3 && (
            <span className="stock-alert-chip">
              <Flame size={11} /> Low stock
            </span>
          )}
        </div>

        <Link to={`/shop/products/${product._id}`} className="product-title-link">
          <h3 title={title}>{title}</h3>
        </Link>

        <p className="product-description">
          {description}
        </p>

        <div className="product-price-row">
          <div className="price-tag-wrap">
            <span className="currency-symbol">₹</span>
            <strong className="price-amount">
              {Number(product.price || 0).toLocaleString("en-IN")}
            </strong>
          </div>
          <span className="product-availability">
            {stock > 0 ? "Cash on Delivery" : "Unavailable"}
          </span>
        </div>

        {/* Action Controls */}
        <div className="product-cart-actions">
          <button
            type="button"
            className="add-cart-button"
            disabled={stock <= 0}
            onClick={handleAdd}
          >
            <ShoppingCart size={15} />
            {quantity > 0 ? `In Cart (${quantity})` : "Add to Cart"}
          </button>

          {quantity > 0 && (
            <div className="product-quantity-control">
              <button
                type="button"
                className="quantity-btn"
                onClick={handleDecrease}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span className="quantity-number">
                {quantity}
              </span>

              <button
                type="button"
                className="quantity-btn"
                onClick={handleIncrease}
                disabled={quantity >= stock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>

        {message && (
          <p className="quantity-message">{message}</p>
        )}
      </div>
    </article>
  );
}

// ==========================================
// PRODUCT GRID
// ==========================================

export function ProductGrid({ products = [] }) {
  return (
    <div className="products-grid">
      {products.map(product => (
        <ProductCard
          key={product._id}
          product={product}
        />
      ))}
    </div>
  );
}

// ==========================================
// CUSTOMER DASHBOARD
// ==========================================

export function ShopDashboard() {
  const { products, loading, error } = useProducts();
  const { cartCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const stock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const categoryList = useMemo(() => {
    const cats = new Set(DEFAULT_CATEGORIES);
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  const filteredFeatured = useMemo(() => {
    if (selectedCategory === "All") return products.slice(0, 6);
    return products.filter(p => matchesCategoryFilter(p.category, selectedCategory)).slice(0, 6);
  }, [products, selectedCategory]);

  return (
    <div className="dashboard-page">
      {/* Hero Showcase */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <div className="welcome-tag-pill">
            <Sparkles size={14} /> VERIFIED CAMPUS COMMERCE
          </div>
          <h1>Buy & Sell Essentials Across Campus.</h1>
          <p>
            Textbooks, electronics, lab supplies, and dorm essentials directly from fellow students. Safe peer handover with Cash on Delivery.
          </p>

          <div className="welcome-actions-row">
            <Link className="welcome-action primary" to="/shop/products">
              Explore All Listings <ArrowRight size={16} />
            </Link>
            <Link className="welcome-action secondary" to="/shop/orders">
              Track My Orders
            </Link>
          </div>

          <div className="welcome-trust-badges">
            <span><CheckCircle2 size={13} /> Zero Listing Fees</span>
            <span><CheckCircle2 size={13} /> Same-Day Campus Handover</span>
            <span><CheckCircle2 size={13} /> Cash on Delivery (COD)</span>
          </div>
        </div>
      </section>

      {/* KPI Metric Cards */}
      <div className="dashboard-stats-grid user-stats">
        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon emerald"><Package size={20} /></div>
            <span>Available Products</span>
          </div>
          <strong>{loading ? "..." : products.length}</strong>
          <p>Active items in student catalog</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon blue"><ShoppingCart size={20} /></div>
            <span>Shopping Cart</span>
          </div>
          <strong>{cartCount}</strong>
          <p>Items ready for checkout</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon amber"><Package size={20} /></div>
            <span>Total Units</span>
          </div>
          <strong>{stock}</strong>
          <p>Total units available in stock</p>
        </div>
      </div>

      {/* Quick Category Filter Bar */}
      <div className="category-pill-strip">
        <span className="category-strip-label"><SlidersHorizontal size={14} /> Categories:</span>
        <div className="category-pills">
          {categoryList.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Section Header */}
      <div className="dashboard-section-heading">
        <div>
          <h2>Featured Campus Listings</h2>
          <p>
            {selectedCategory === "All" 
              ? "Discover the newest arrivals from students" 
              : `Showing top items in ${selectedCategory}`}
          </p>
        </div>
        <Link to="/shop/products" className="view-all-link">
          Browse full catalog <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="page-loading">Loading marketplace listings...</div>
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : filteredFeatured.length > 0 ? (
        <ProductGrid products={filteredFeatured} />
      ) : (
        <div className="products-empty">
          <Package size={44} />
          <h3>No items in this category yet</h3>
          <p>Try switching to "All" or browse the full catalog.</p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// ALL PRODUCTS CATALOG
// ==========================================

export function ShopProducts() {
  const { products, loading, error } = useProducts();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categoryList = useMemo(() => {
    const cats = new Set(DEFAULT_CATEGORIES);
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  const shown = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = matchesCategoryFilter(product.category, category);

      const title = product.name || product.title || "";
      const desc = product.description || product.desc || "";
      const cat = product.category || "";

      const matchesSearch =
        !search.trim() ||
        `${title} ${desc} ${cat}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">CAMPUS MARKETPLACE</span>
          <h1>Explore Products</h1>
          <p>Discover textbooks, gear, and student items with safe campus pickup.</p>
        </div>

        <Link to="/shop/cart" className="primary-action">
          <ShoppingCart size={17} /> View Cart
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="catalog-category-tabs">
        {categoryList.map(cat => (
          <button
            key={cat}
            type="button"
            className={`catalog-tab ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="products-toolbar">
        <div className="products-search">
          <Search size={18} />
          <input
            placeholder="Search by product name, description, textbook..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
          {search && (
            <button 
              type="button" 
              className="search-clear-btn"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-filter">
          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
          >
            {categoryList.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="catalog-count-badge">
          {shown.length} {shown.length === 1 ? "item" : "items"}
        </div>
      </div>

      {/* Product Content */}
      {loading ? (
        <div className="page-loading">Loading catalog listings...</div>
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : shown.length > 0 ? (
        <ProductGrid products={shown} />
      ) : (
        <div className="products-empty">
          <Package size={44} />
          <h3>No products match your criteria</h3>
          <p>Try searching with different terms or selecting "All" categories.</p>
          <button 
            type="button" 
            className="clear-filters-btn"
            onClick={() => { setSearch(""); setCategory("All"); }}
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
