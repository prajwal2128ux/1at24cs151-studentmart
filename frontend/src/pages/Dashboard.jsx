
import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Boxes,
  IndianRupee,
  Tags,
  Plus,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";

const API_BASE = "http://localhost:5000";

export default function Dashboard() {
  const { products, loading } = useProducts();

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum + Number(product.price || 0) * Number(product.stock || 0),
    0
  );

  const categoryCount = new Set(
    products.map((product) => product.category)
  ).size;

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5
  );

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      description: "Products in inventory",
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: Boxes,
      description: "Available units",
    },
    {
      title: "Inventory Value",
      value: `₹${inventoryValue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      description: "Based on current stock",
    },
    {
      title: "Categories",
      value: categoryCount,
      icon: Tags,
      description: "Product categories",
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span>STUDENTMART OVERVIEW</span>
          <h1>Welcome back, Manohar!</h1>
          <p>Manage your campus marketplace from one place.</p>
          <Link to="/add-product" className="welcome-action">
            <Plus size={17} /> Add New Product
          </Link>
        </div>
        <div className="welcome-decoration">
          <Package size={105} />
        </div>
      </section>

      <div className="dashboard-section-heading">
        <div>
          <h2>Inventory Overview</h2>
          <p>Your current marketplace statistics</p>
        </div>
        <Link to="/products">View Products <ArrowRight size={15} /></Link>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="dashboard-stats-grid">
          {stats.map(({ title, value, icon: Icon, description }) => (
            <div className="dashboard-stat-card" key={title}>
              <div className="stat-card-top">
                <div className="stat-icon"><Icon size={22} /></div>
                <span>{title}</span>
              </div>
              <strong>{value}</strong>
              <p>{description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Products</h2>
              <p>Latest items added to your inventory</p>
            </div>
            <Link to="/products">View all</Link>
          </div>

          {products.length === 0 ? (
            <div className="dashboard-empty">
              <Package size={35} />
              <h3>No products yet</h3>
              <p>Add your first product to populate the dashboard.</p>
              <Link to="/add-product" className="primary-action">
                <Plus size={16} /> Add Product
              </Link>
            </div>
          ) : (
            <div className="recent-product-list">
              {[...products].slice(0, 5).map((product) => (
                <div className="recent-product-row" key={product._id}>
                  {product.imageUrl || product.image ? (
                    <img
                      src={
                        (product.imageUrl || product.image).startsWith("data:") ||
                        (product.imageUrl || product.image).startsWith("http")
                          ? (product.imageUrl || product.image)
                          : `${API_BASE}/${(product.imageUrl || product.image).replace(/^\/+/, "")}`
                      }
                      alt={product.name || product.title}
                    />
                  ) : (
                    <div className="recent-product-placeholder">
                      <Package size={22} />
                    </div>
                  )}
                  <div className="recent-product-info">
                    <strong>{product.name || product.title}</strong>
                    <span>{product.category}</span>
                  </div>
                  <div className="recent-product-price">
                    <strong>
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </strong>
                    <span>{product.stock} units</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Inventory Alerts</h2>
              <p>Products requiring attention</p>
            </div>
            <AlertTriangle size={21} color="#e39b36" />
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="alert-empty">
              <span className="alert-check">✓</span>
              <h3>All good!</h3>
              <p>No products currently have low stock.</p>
            </div>
          ) : (
            lowStockProducts.map((product) => (
              <div className="inventory-alert-row" key={product._id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.stock} units remaining</span>
                </div>
                <Link to={`/edit-product/${product._id}`}>Update</Link>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
