
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, Package, Pencil, Trash2, Filter,
  RefreshCw, ShoppingCart, X,
} from "lucide-react";
import { useProducts, API_BASE } from "../context/ProductContext";
import { useCart } from "../context/CartContext";

const categories = ["All", "Electronics", "Books", "Stationery", "Accessories", "Clothing", "Other"];

export default function Products() {
  const { products, loading, error, deleteProduct, fetchProducts } = useProducts();
  const { addToCart, cartItems, cartCount } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => products.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.name?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term)) &&
      (category === "All" || p.category === category)
    );
  }), [products, search, category]);

  const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const add = (product) => {
    try {
      addToCart(product);
      setNotice(`${product.name} added to cart.`);
    } catch (err) {
      setNotice(err.message);
    }
    window.setTimeout(() => setNotice(""), 2500);
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await deleteProduct(product._id);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete product.");
    }
  };

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">CAMPUS MARKETPLACE</span>
          <h1>Products</h1>
          <p>Browse and manage your marketplace products.</p>
        </div>
        <div className="products-heading-actions">
          <Link to="/cart" className="cart-action-button"><ShoppingCart size={18}/> Cart ({cartCount})</Link>
          <Link to="/add-product" className="primary-action"><Plus size={18}/> Add Product</Link>
        </div>
      </div>

      {notice && <div className="cart-success-message">{notice}<Link to="/cart">View Cart</Link></div>}

      <div className="product-summary">
        <div><span>Total Products</span><strong>{products.length}</strong></div>
        <div><span>Search Results</span><strong>{filtered.length}</strong></div>
        <div><span>Low Stock</span><strong>{products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length}</strong></div>
        <div><span>Out of Stock</span><strong>{products.filter(p => Number(p.stock) === 0).length}</strong></div>
      </div>

      <div className="products-toolbar">
        <div className="products-search">
          <Search size={18}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."/>
          {search && <button onClick={() => setSearch("")}><X size={16}/></button>}
        </div>
        <div className="category-filter">
          <Filter size={17}/>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(item => <option key={item} value={item}>{item === "All" ? "All Categories" : item}</option>)}
          </select>
        </div>
        <button className="refresh-button" onClick={fetchProducts} title="Refresh"><RefreshCw size={18}/></button>
      </div>

      {loading ? (
        <div className="products-empty"><RefreshCw size={30}/><h3>Loading products...</h3></div>
      ) : error ? (
        <div className="products-error"><p>{String(error)}</p><button onClick={fetchProducts}>Try Again</button></div>
      ) : filtered.length === 0 ? (
        <div className="products-empty">
          <Package size={42}/>
          <h3>{products.length ? "No matching products" : "No products added yet"}</h3>
          <p>{products.length ? "Try another search or category." : "Add your first product."}</p>
          <Link to="/add-product" className="primary-action"><Plus size={17}/> Add Product</Link>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(product => {
            const stock = Number(product.stock || 0);
            const item = cartItems.find(p => p._id === product._id);
            const limitReached = item && item.quantity >= stock;

            return (
              <article className="product-card" key={product._id}>
                <div className="product-image-wrap">
                  {product.imageUrl ? (
                    <img src={`${API_BASE}${product.imageUrl}`} alt={product.name}
                      onError={e => { e.currentTarget.style.display = "none"; }}/>
                  ) : <Package size={40}/>}
                  <span className={`stock-badge ${stock === 0 ? "stock-out" : stock <= 5 ? "stock-low" : "stock-good"}`}>
                    {stock === 0 ? "Out of stock" : stock <= 5 ? "Low stock" : "In stock"}
                  </span>
                </div>
                <div className="product-card-content">
                  <span className="product-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price-row">
                    <strong>{money(product.price)}</strong><span>{stock} units</span>
                  </div>
                  <button className="add-cart-button" disabled={stock <= 0 || Boolean(limitReached)} onClick={() => add(product)}>
                    <ShoppingCart size={16}/>
                    {stock <= 0 ? "Out of Stock" : limitReached ? "Stock Limit Reached" : item ? "Add More" : "Add to Cart"}
                  </button>
                  <div className="product-card-actions">
                    <Link to={`/edit-product/${product._id}`} className="edit-product-button"><Pencil size={15}/> Edit</Link>
                    <button className="delete-product-button" onClick={() => remove(product)}><Trash2 size={15}/> Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className="products-footer">Showing {filtered.length} of {products.length} products</div>
    </div>
  );
}
