
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  ClipboardList,
  IndianRupee,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

import { useProducts } from "../context/ProductContext";
import { API_BASE } from "../api";
import api from "../api";

// Convert stored image paths into browser URLs
function getProductImageUrl(imageUrl) {
  if (!imageUrl) return "";

  const image = String(imageUrl).trim();

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_BASE}/${image.replace(/^\/+/, "")}`;
}

// Product image with fallback
function ProductThumbnail({ imageUrl }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = getProductImageUrl(imageUrl);

  if (!imageSrc || failed) {
    return (
      <Package
        size={28}
        className="product-image-fallback"
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt="Product"
      onError={() => setFailed(true)}
    />
  );
}

// ADMIN DASHBOARD
export function AdminDashboard() {
  const { products, loading } = useProducts();

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    orderValue: 0
  });

  useEffect(() => {
    api.get("/admin/stats")
      .then((response) => setStats(response.data))
      .catch((error) => console.error("Stats error:", error));
  }, []);

  const stock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const cards = [
    ["Products", products.length, Package],
    ["Total Stock", stock, Package],
    ["Customers", stats.users, Users],
    ["Orders", stats.orders, ClipboardList],
    [
      "Order Value",
      `₹${Number(stats.orderValue || 0).toLocaleString("en-IN")}`,
      IndianRupee
    ]
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span>ADMINISTRATOR PORTAL</span>
          <h1>Welcome back, Admin!</h1>
          <p>Manage products, inventory and customer orders.</p>

          <Link className="welcome-action" to="/admin/products">
            <Plus size={16} /> Manage Products
          </Link>
        </div>
      </section>

      <div className="dashboard-section-heading">
        <div>
          <h2>Store Overview</h2>
          <p>Live marketplace statistics</p>
        </div>
      </div>

      <div className="dashboard-stats-grid admin-stats">
        {cards.map(([title, value, Icon]) => (
          <div className="dashboard-stat-card" key={title}>
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon size={20} />
              </div>
              {title}
            </div>

            <strong>{loading ? "..." : value}</strong>
            <p>Current store data</p>
          </div>
        ))}
      </div>

      <div className="dashboard-section-heading">
        <div>
          <h2>Quick Actions</h2>
          <p>Common administration tasks</p>
        </div>
      </div>

      <div className="admin-quick-actions">
        <Link to="/admin/products" className="primary-action">
          <Package size={17} /> Manage Products
        </Link>

        <Link to="/admin/orders" className="back-button">
          <ClipboardList size={17} /> Manage Orders
        </Link>

        <Link to="/admin/users" className="back-button">
          <Users size={17} /> View Customers
        </Link>
      </div>
    </div>
  );
}

// ADMIN PRODUCTS
export function AdminProducts() {
  const { products, loading, error, deleteProduct } = useProducts();

  const remove = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    try {
      await deleteProduct(product._id);
    } catch (error) {
      alert(
        error.response?.data?.message || "Delete failed."
      );
    }
  };

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">INVENTORY CONTROL</span>
          <h1>Manage Products</h1>
          <p>Add, update and remove marketplace products.</p>
        </div>

        <Link className="primary-action" to="/admin/products/add">
          <Plus size={17} /> Add Product
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="admin-product-table-wrap">
          <table className="admin-product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="admin-table-product">
                      <ProductThumbnail imageUrl={product.imageUrl} />
                      <strong>{product.name}</strong>
                    </div>
                  </td>

                  <td>{product.category}</td>

                  <td>
                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                  </td>

                  <td>{product.stock}</td>

                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/products/edit/${product._id}`}>
                        <Pencil size={15} /> Edit
                      </Link>

                      <button onClick={() => remove(product)}>
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="5">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ADMIN CUSTOMERS
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/users");

        if (active) {
          setUsers(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (error) {
        if (active) {
          setError(
            error.response?.data?.message ||
            "Unable to load customer details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      String(user.name || "").toLowerCase().includes(query) ||
      String(user.email || "").toLowerCase().includes(query) ||
      String(user.role || "user").toLowerCase().includes(query)
    );
  });

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="products-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">CUSTOMER MANAGEMENT</span>
          <h1>Customers</h1>
          <p>View and manage registered StudentMart accounts.</p>
        </div>

        <div className="customer-total-card">
          <Users size={22} />
          <div>
            <strong>{users.length}</strong>
            <span>Total Customers</span>
          </div>
        </div>
      </div>

      <div className="customer-toolbar">
        <div className="products-search">
          <Users size={18} />

          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="customers-message">
          Loading customer details...
        </div>
      ) : error ? null : (
        <div className="admin-product-table-wrap">
          <table className="admin-product-table customer-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email Address</th>
                <th>Account Type</th>
                <th>Registration Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="customer-name-cell">
                      <div className="customer-avatar">
                        {String(user.name || "U")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <strong>
                        {user.name || "Unnamed Customer"}
                      </strong>
                    </div>
                  </td>

                  <td>{user.email || "No email available"}</td>

                  <td>
                    <span className="customer-role">
                      {user.role || "User"}
                    </span>
                  </td>

                  <td>{formatDate(user.createdAt)}</td>

                  <td>
                    <span className="customer-status">
                      Registered
                    </span>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="customer-empty-cell">
                    {users.length === 0
                      ? "No customer accounts found."
                      : "No customers match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
