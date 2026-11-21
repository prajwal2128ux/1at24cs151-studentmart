
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Package,
  ArrowRight
} from "lucide-react";

import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../api";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  const image = String(imageUrl).trim();

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_BASE}/${image.replace(/^\/+/, "")}`;
}

// ==========================================
// PRODUCT CARD
// ==========================================

function ProductCard({ product }) {
  const {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity
  } = useCart();

  const [imageError, setImageError] = useState(false);
  const [message, setMessage] = useState("");

  const cartProduct = cartItems.find(
    item => item._id === product._id
  );

  const quantity = cartProduct
    ? Number(cartProduct.quantity)
    : 0;

  const stock = Math.max(0, Number(product.stock || 0));

  const imageSrc = getImageUrl(product.imageUrl);

  const handleAdd = () => {
    try {
      addToCart(product);
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

      <div className="product-image-wrap">
        {imageSrc && !imageError ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="product-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="product-image-fallback">
            <Package size={45} />
            <span>Image unavailable</span>
          </div>
        )}

        <span className={`stock-badge ${
          stock > 5
            ? "stock-good"
            : stock > 0
            ? "stock-low"
            : "stock-out"
        }`}>
          {stock > 0 ? `${stock} available` : "Out of stock"}
        </span>
      </div>

      <div className="product-card-content">

        <span className="product-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-price-row">
          <strong>
            ₹{Number(product.price || 0).toLocaleString("en-IN")}
          </strong>
          <span>{stock} units</span>
        </div>

        {/* Add to Cart and quantity controls side by side */}
        <div className="product-cart-actions">

          <button
            type="button"
            className="add-cart-button"
            disabled={stock <= 0}
            onClick={handleAdd}
          >
            Add to Cart
          </button>

          <div className="product-quantity-control">

            <button
              type="button"
              className="quantity-btn"
              onClick={handleDecrease}
              disabled={quantity <= 0}
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
              disabled={stock <= 0 || quantity >= stock}
              aria-label="Increase quantity"
            >
              +
            </button>

          </div>

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

  const stock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  return (
    <div className="dashboard-page">

      <section className="dashboard-welcome">
        <div>
          <span>STUDENTMART MARKETPLACE</span>
          <h1>Welcome to StudentMart!</h1>
          <p>Discover useful products for campus life.</p>

          <Link className="welcome-action" to="/shop/products">
            Explore Products <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <div className="dashboard-stats-grid user-stats">

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon"><Package /></div>
            Available Products
          </div>
          <strong>{loading ? "..." : products.length}</strong>
          <p>Products listed in marketplace</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon"><ShoppingCart /></div>
            Cart Items
          </div>
          <strong>{cartCount}</strong>
          <p>Items in your shopping cart</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon"><Package /></div>
            Available Units
          </div>
          <strong>{stock}</strong>
          <p>Total listed stock</p>
        </div>

      </div>

      <div className="dashboard-section-heading">
        <div>
          <h2>Featured Products</h2>
          <p>Explore the latest additions.</p>
        </div>
        <Link to="/shop/products">
          Browse all <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : (
        <ProductGrid products={products.slice(0, 4)} />
      )}

    </div>
  );
}

// ==========================================
// ALL PRODUCTS
// ==========================================

export function ShopProducts() {
  const { products, loading, error } = useProducts();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Electronics",
    "Books",
    "Stationery",
    "Accessories",
    "Clothing",
    "Other"
  ];

  const shown = useMemo(() => {
    return products.filter(product => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch =
        `${product.name} ${product.description}`
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
          <h1>Browse Products</h1>
          <p>Find what you need for campus life.</p>
        </div>

        <Link to="/shop/cart" className="primary-action">
          <ShoppingCart size={17} /> View Cart
        </Link>
      </div>

      <div className="products-toolbar">

        <div className="products-search">
          <Search size={18} />
          <input
            placeholder="Search products..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        <div className="category-filter">
          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
          >
            {categories.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <div className="form-error">{error}</div>
      ) : shown.length > 0 ? (
        <ProductGrid products={shown} />
      ) : (
        <div className="products-empty">
          <Package size={40} />
          <h3>No products found</h3>
          <p>Try a different search or category.</p>
        </div>
      )}

    </div>
  );
}
