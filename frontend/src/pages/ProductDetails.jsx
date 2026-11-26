import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Minus,
  Plus,
  Zap
} from "lucide-react";
import api from "../api";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { CATEGORY_FALLBACK_IMAGES, ProductGrid, getProductImageUrl } from "./Marketplace";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { cartItems, addToCart, increaseQuantity } = useCart();

  const cachedProduct = useMemo(
    () => products.find((p) => p._id === id) || null,
    [products, id]
  );

  const [product, setProduct] = useState(cachedProduct);
  const [loading, setLoading] = useState(!cachedProduct);
  const [error, setError] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [addedNotice, setAddedNotice] = useState("");
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(() =>
    cachedProduct
      ? getProductImageUrl(cachedProduct.imageUrl || cachedProduct.image, cachedProduct.category)
      : ""
  );

  useEffect(() => {
    let active = true;
    setSelectedQty(1);
    setAddedNotice("");
    setImageError(false);

    if (cachedProduct) {
      setProduct(cachedProduct);
      setImageSrc(
        getProductImageUrl(cachedProduct.imageUrl || cachedProduct.image, cachedProduct.category)
      );
      setLoading(false);
    } else {
      setLoading(true);
    }

    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        if (!active) return;
        setProduct(data);
        setImageSrc(getProductImageUrl(data.imageUrl || data.image, data.category));
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        if (!cachedProduct) {
          setError(err.response?.data?.message || "Unable to load product details.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, cachedProduct]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item._id !== product._id)
      .sort((a, b) => {
        const aMatch = a.category === product.category ? 0 : 1;
        const bMatch = b.category === product.category ? 0 : 1;
        return aMatch - bMatch;
      })
      .slice(0, 3);
  }, [products, product]);

  if (loading) {
    return <div className="page-loading">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="products-page">
        <div className="products-empty">
          <Package size={44} />
          <h3>Product not found</h3>
          <p>{error || "This campus listing may have been removed or is no longer available."}</p>
          <Link to="/shop/products" className="primary-action">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const stock = Math.max(0, Number(product.stock || 0));
  const title = product.name || product.title || "Campus Item";
  const description =
    product.description || product.desc || "Available for verified campus peer handover.";
  const cartProduct = cartItems.find((item) => item._id === product._id);
  const inCartQty = cartProduct ? Number(cartProduct.quantity) : 0;
  const maxAddable = Math.max(0, stock - inCartQty);

  const handleImageError = () => {
    const fallback = CATEGORY_FALLBACK_IMAGES[product.category] || CATEGORY_FALLBACK_IMAGES.Other;
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    } else {
      setImageError(true);
    }
  };

  const addQuantityToCart = (qtyToAdd) => {
    const normalizedProduct = {
      ...product,
      name: title,
      title,
      description,
      desc: description,
      imageUrl: imageSrc,
      image: imageSrc,
    };

    if (inCartQty === 0) {
      addToCart(normalizedProduct);
      for (let i = 1; i < qtyToAdd; i += 1) {
        increaseQuantity(product._id);
      }
    } else {
      for (let i = 0; i < qtyToAdd; i += 1) {
        increaseQuantity(product._id);
      }
    }
  };

  const handleAddToBag = () => {
    if (stock <= 0) return;
    if (maxAddable <= 0) {
      setAddedNotice(`You already have all ${stock} available units in your bag.`);
      return;
    }
    const qty = Math.min(selectedQty, maxAddable);
    addQuantityToCart(qty);
    setAddedNotice(`Added ${qty} ${qty === 1 ? "item" : "items"} to your shopping bag.`);
  };

  const handleBuyNow = () => {
    if (stock <= 0) return;
    if (inCartQty === 0) {
      const qty = Math.min(selectedQty, stock);
      addQuantityToCart(qty);
    }
    navigate("/shop/checkout");
  };

  return (
    <div className="products-page">
      <div className="product-detail-breadcrumb">
        <Link to="/shop/products" className="detail-back-link">
          <ArrowLeft size={16} />
          <span>All Campus Products</span>
        </Link>
        <span className="detail-crumb-sep">/</span>
        <span className="detail-crumb-cat">{product.category || "Item"}</span>
      </div>

      <section className="product-detail-layout">
        {/* Left: Studio Image Showcase */}
        <div className="product-detail-media">
          <div className="detail-studio-frame">
            {imageSrc && !imageError ? (
              <img
                src={imageSrc}
                alt={title}
                onError={handleImageError}
              />
            ) : (
              <div className="product-image-fallback">
                <Package size={56} />
                <span>{product.category || "Campus Item"}</span>
              </div>
            )}

            <span
              className={`stock-badge ${
                stock > 5 ? "stock-good" : stock > 0 ? "stock-low" : "stock-out"
              }`}
            >
              {stock > 0 ? `${stock} available` : "Out of stock"}
            </span>
          </div>
        </div>

        {/* Right: Specifications & Purchase Controls */}
        <div className="product-detail-info">
          <span className="detail-category-label">{product.category || "Campus Essential"}</span>
          <h1 className="detail-title">{title}</h1>

          <div className="detail-price-block">
            <strong className="detail-price">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </strong>
            <span className="detail-price-note">Zero platform fee · Cash on Delivery</span>
          </div>

          <p className="detail-description">{description}</p>

          {stock > 0 && (
            <div className="detail-qty-row">
              <span className="detail-qty-label">Quantity</span>
              <div className="product-quantity-control">
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  disabled={selectedQty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="quantity-number">{selectedQty}</span>
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => setSelectedQty((q) => Math.min(Math.max(1, maxAddable), q + 1))}
                  disabled={selectedQty >= Math.max(1, maxAddable)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              {inCartQty > 0 && (
                <span className="detail-in-cart-note">{inCartQty} currently in bag</span>
              )}
            </div>
          )}

          <div className="detail-actions">
            <button
              type="button"
              className="detail-add-btn"
              disabled={stock <= 0}
              onClick={handleAddToBag}
            >
              <ShoppingCart size={17} />
              <span>{stock <= 0 ? "Currently Sold Out" : "Add to Cart"}</span>
            </button>

            <button
              type="button"
              className="detail-buy-btn"
              disabled={stock <= 0}
              onClick={handleBuyNow}
            >
              <Zap size={16} />
              <span>Buy Now</span>
            </button>
          </div>

          {addedNotice && (
            <div className="detail-added-notice">
              <CheckCircle2 size={16} />
              <span>{addedNotice}</span>
              <Link to="/shop/cart">View Bag →</Link>
            </div>
          )}

          <div className="detail-guarantees">
            <div className="detail-guarantee-item">
              <Truck size={18} />
              <div>
                <strong>On-Campus Handover</strong>
                <span>Arrange pickup directly on campus or enter your hostel delivery address.</span>
              </div>
            </div>
            <div className="detail-guarantee-item">
              <ShieldCheck size={18} />
              <div>
                <strong>Inspect Before Paying</strong>
                <span>Pay with Cash on Delivery only after inspecting the item in person.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="detail-related-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>You might also like</h2>
              <p>More verified student listings from your campus catalog</p>
            </div>
            <Link to="/shop/products" className="view-all-link">
              View all items →
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
