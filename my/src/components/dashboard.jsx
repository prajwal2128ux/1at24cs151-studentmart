import "../style/dashboard.css";
import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ initialTab = "profile" }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });

  // Search, Category, Price Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceSort, setPriceSort] = useState("default");

  // Initial student products with images
  const defaultProducts = [
    {
      id: 1,
      title: "Engineering Mathematics Textbook",
      price: 450,
      category: "Books",
      desc: "VTU 3rd & 4th sem mathematics textbook in mint condition with solved papers.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      title: "Scientific Calculator FX-991EX",
      price: 850,
      category: "Gadgets",
      desc: "Casio Classwiz calculator with solar battery, accepted in all semester exams.",
      image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      title: "Campus College Backpack",
      price: 650,
      category: "College Bags",
      desc: "Durable water-resistant college bag with 3 compartments & padded laptop sleeve.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: 4,
      title: "Lab Coat & Safety Apron (Size M)",
      price: 299,
      category: "Uniform",
      desc: "100% white cotton lab apron suitable for Chemistry and Physics lab experiments.",
      image: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: 5,
      title: "Engineering Drawing Kit & Drafter",
      price: 550,
      category: "Stationery",
      desc: "Mini drafter with scale, clamps, sheet holder, and protective carrying case.",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: 6,
      title: "Wireless Study Earbuds",
      price: 1199,
      category: "Gadgets",
      desc: "Noise-isolating bluetooth earbuds with 20hr battery for study and library sessions.",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    },
  ];

  // Persistent products & cart
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("studentmartProducts");
      return saved ? JSON.parse(saved) : defaultProducts;
    } catch {
      return defaultProducts;
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("studentmartCart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New product form state with image section
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    category: "Books",
    desc: "",
    image: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("studentmartToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("studentmartToken");
          localStorage.removeItem("studentmartUser");
          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();
        const userData = data.user || data;

        if (userData) {
          setUser(userData);
          setEditForm({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            department: userData.department || userData.course || "",
            year: userData.year || "",
            address: userData.address || userData.college || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("studentmartToken");
    localStorage.removeItem("studentmartUser");
    navigate("/login", { replace: true });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage({ type: "", text: "" });

    const token = localStorage.getItem("studentmartToken");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      const updatedUser = data.user || { ...user, ...editForm };
      setUser(updatedUser);
      localStorage.setItem("studentmartUser", JSON.stringify(updatedUser));
      setAlertMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditModalOpen(false);
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage({ type: "", text: "" });

    if (passwordForm.newPassword.length < 6) {
      setAlertMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    const token = localStorage.getItem("studentmartToken");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      setPasswordForm({ currentPassword: "", newPassword: "" });
      setAlertMessage({ type: "success", text: "Password changed successfully!" });
      setIsPasswordModalOpen(false);
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Image Upload Handler (reads image file and converts to base64 preview)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAlertMessage({ type: "error", text: "Please select an image file." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewProduct((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Add Product Handler
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.title.trim() || !newProduct.price) {
      setAlertMessage({ type: "error", text: "Please fill in title and price." });
      return;
    }

    const fallbackImage =
      newProduct.category === "Books"
        ? "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
        : newProduct.category === "Gadgets"
        ? "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"
        : newProduct.category === "College Bags"
        ? "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
        : newProduct.category === "Uniform"
        ? "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80";

    const item = {
      id: Date.now(),
      title: newProduct.title.trim(),
      price: Number(newProduct.price),
      category: newProduct.category,
      desc: newProduct.desc.trim() || "Available for campus pickup.",
      image: newProduct.image || fallbackImage,
    };

    const updated = [item, ...products];
    setProducts(updated);
    try {
      localStorage.setItem("studentmartProducts", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage full, saved in state", err);
    }

    setNewProduct({
      title: "",
      price: "",
      category: "Books",
      desc: "",
      image: "",
    });

    setAlertMessage({
      type: "success",
      text: `"${item.title}" added to Student Store!`,
    });

    setIsAddProductModalOpen(false);
    setActiveTab("view-products");
  };

  const addToCart = (product) => {
    const updated = [...cart, product];
    setCart(updated);
    try {
      localStorage.setItem("studentmartCart", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage error", err);
    }
    setAlertMessage({ type: "success", text: `Added "${product.title}" to cart!` });
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      term === "" ||
      item.title.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (priceSort === "low-to-high") {
      return a.price - b.price;
    }
    if (priceSort === "high-to-low") {
      return b.price - a.price;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading StudentMart...
      </div>
    );
  }

  // Display attributes matching profile screenshot
  const displayName = user?.name || user?.usn?.toLowerCase() || "feb";
  const avatarLetter = (user?.name || user?.usn || "F").charAt(0).toUpperCase();
  const displayEmail = user?.email || "feb@gmail.com";
  const displayPhone = user?.phone || "1234567890";
  const displayDepartment = user?.department || user?.course || "CSE";
  const displayYear = user?.year || "2026";
  const displayAddress = user?.address || user?.college || "Bangalore, Karnataka";

  return (
    <div className="portal-container">
      {/* =========================================
          LEFT SIDEBAR (EXACT SCREENSHOT LAYOUT)
          ========================================= */}
      <aside className="portal-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">S</div>
          <span className="brand-title">StudentMart</span>
        </div>

        {/* Menu title */}
        <div className="sidebar-menu-title">MAIN MENU</div>

        {/* Navigation list matching the photo */}
        <nav className="sidebar-nav">
          {/* 1. Profile */}
          <button
            type="button"
            className={`sidebar-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="sidebar-icon">
              {/* Profile Outline Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            Profile
          </button>

          {/* 2. Add Products */}
          <button
            type="button"
            className={`sidebar-item ${activeTab === "add-products" ? "active" : ""}`}
            onClick={() => setActiveTab("add-products")}
          >
            <span className="sidebar-icon">
              {/* Plus in Square Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            Add Products
          </button>

          {/* 3. View Products */}
          <button
            type="button"
            className={`sidebar-item ${activeTab === "view-products" || activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("view-products")}
          >
            <span className="sidebar-icon">
              {/* Isometric Box / Package Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </span>
            View Products
          </button>

          {/* 4. Shopping Cart */}
          <button
            type="button"
            className={`sidebar-item ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => setActiveTab("cart")}
          >
            <span className="sidebar-icon">
              {/* Cart Outline Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </span>
            Shopping Cart {cart.length > 0 && `(${cart.length})`}
          </button>
        </nav>

        {/* Logout at bottom */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span className="sidebar-icon">
              {/* Logout Exit Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* =========================================
          RIGHT MAIN CONTENT AREA
          ========================================= */}
      <main className="portal-content">
        {/* Global Feedback Alert */}
        {alertMessage.text && (
          <div className={`alert-box ${alertMessage.type}`}>
            {alertMessage.text}
          </div>
        )}

        {/* =========================================
            1. PROFILE VIEW (SCREENSHOT 1)
            ========================================= */}
        {activeTab === "profile" && (
          <div>
            <header className="portal-header">
              <h1>Welcome, {displayName}! 👋</h1>
              <p>Manage your StudentMart profile here.</p>
            </header>

            <div className="profile-card-container">
              <div className="profile-box">
                <h2 className="profile-box-title">My Profile</h2>

                {/* Avatar circle with initial */}
                <div className="profile-avatar-circle">
                  {avatarLetter}
                </div>

                {/* Details List */}
                <div className="profile-details-list">
                  <div className="profile-detail-row">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{displayName}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{displayEmail}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{displayPhone}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="detail-label">Department</span>
                    <span className="detail-value">{displayDepartment}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="detail-label">Year</span>
                    <span className="detail-value">{displayYear}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{displayAddress}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn-edit-profile"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    className="btn-change-password"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            2. VIEW PRODUCTS / STUDENT STORE (SCREENSHOT 2)
            ========================================= */}
        {(activeTab === "view-products" || activeTab === "products") && (
          <div className="store-container">
            {/* Header: Student Store + Cart & Add Product */}
            <div className="store-header">
              <h2 className="store-title">Student Store</h2>

              <div className="store-header-actions">
                <button
                  type="button"
                  className="btn-store-cart"
                  onClick={() => setActiveTab("cart")}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Cart
                  {cart.length > 0 && (
                    <span className="cart-count-badge">{cart.length}</span>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-store-add"
                  onClick={() => setIsAddProductModalOpen(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  + Add Product
                </button>
              </div>
            </div>

            <hr className="store-divider" />

            {/* Search, Category & Price Sort Bar */}
            <div className="store-filter-bar">
              {/* Search input */}
              <input
                type="text"
                className="store-search-input"
                placeholder="Search for pen, book, uniform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Category Filter */}
              <select
                className="store-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Books">Books</option>
                <option value="Gadgets">Gadgets</option>
                <option value="College Bags">College Bags</option>
                <option value="Uniform">Uniform</option>
                <option value="Stationery">Stationery</option>
                <option value="Essentials">Essentials</option>
              </select>

              {/* Price Sort Filter */}
              <select
                className="store-select"
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value)}
              >
                <option value="default">Sort by Price</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>

            {/* Products Grid format */}
            {sortedProducts.length === 0 ? (
              <div className="store-empty-box">
                <p>No products found. Add some items like College Bags or Books!</p>
              </div>
            ) : (
              <div className="store-grid">
                {sortedProducts.map((item) => (
                  <div key={item.id} className="store-card">
                    {/* Image Section */}
                    <div className="store-card-img-wrapper">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="store-card-img"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                      <span className="store-card-badge">{item.category}</span>
                    </div>

                    {/* Card Content */}
                    <div className="store-card-body">
                      <h3 className="store-card-title">{item.title}</h3>
                      <p className="store-card-desc">{item.desc}</p>

                      <div className="store-card-footer">
                        <span className="store-card-price">₹{item.price}</span>
                        <button
                          type="button"
                          className="btn-card-add"
                          onClick={() => addToCart(item)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            3. ADD PRODUCTS VIEW
            ========================================= */}
        {activeTab === "add-products" && (
          <div className="store-container">
            <div className="store-header">
              <h2 className="store-title">+ Add Product to Student Store</h2>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab("view-products")}
              >
                ← View Products
              </button>
            </div>

            <hr className="store-divider" />

            <form
              onSubmit={handleAddProduct}
              className="modal-form"
              style={{ maxWidth: "600px" }}
            >
              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. College Bag, Books, Calculator"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 450"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="store-select"
                    style={{ width: "100%", padding: "9px 12px" }}
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                  >
                    <option value="Books">Books</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="College Bags">College Bags</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Essentials">Essentials</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Condition, edition, semester details..."
                  value={newProduct.desc}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, desc: e.target.value })
                  }
                />
              </div>

              {/* IMAGE SECTION */}
              <div className="form-group">
                <label>Product Image</label>

                {/* Upload Image Zone */}
                <div className="image-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="upload-icon">📸</div>
                  <p className="upload-text">Click to choose image file</p>
                  <p className="upload-subtext">Supports PNG, JPG, JPEG from your device</p>
                </div>

                {/* Alternative: Image URL */}
                <div style={{ marginTop: "6px" }}>
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={newProduct.image.startsWith("data:") ? "" : newProduct.image}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image: e.target.value })
                    }
                  />
                </div>

                {/* Live Image Preview */}
                {newProduct.image && (
                  <div className="image-preview-wrapper">
                    <img src={newProduct.image} alt="Product Preview" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      title="Remove image"
                      onClick={() => setNewProduct({ ...newProduct, image: "" })}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "14px" }}>
                <button type="submit" className="btn-primary" style={{ padding: "11px 24px" }}>
                  Publish to Student Store
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================
            4. SHOPPING CART VIEW
            ========================================= */}
        {activeTab === "cart" && (
          <div className="store-container">
            <div className="store-header">
              <h2 className="store-title">Shopping Cart</h2>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab("view-products")}
              >
                ← Continue Shopping
              </button>
            </div>

            <hr className="store-divider" />

            {cart.length === 0 ? (
              <div className="store-empty-box">
                <p>Your cart is empty. Explore products in the Student Store!</p>
              </div>
            ) : (
              <div>
                <div className="profile-details-list" style={{ marginBottom: "24px" }}>
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="profile-detail-row"
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid #f1f5f9",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <strong style={{ display: "block", color: "#0f172a" }}>
                            {item.title}
                          </strong>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <strong style={{ color: "#4f46e5", fontSize: "16px" }}>
                          ₹{item.price}
                        </strong>
                        <button
                          type="button"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                          onClick={() => {
                            const newCart = [...cart];
                            newCart.splice(idx, 1);
                            setCart(newCart);
                            localStorage.setItem("studentmartCart", JSON.stringify(newCart));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <div
                    className="profile-detail-row"
                    style={{
                      paddingTop: "16px",
                      fontSize: "17px",
                      fontWeight: "750",
                    }}
                  >
                    <span>Total Amount:</span>
                    <span style={{ color: "#0f172a" }}>
                      ₹{cart.reduce((sum, item) => sum + item.price, 0)}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setCart([]);
                      localStorage.setItem("studentmartCart", JSON.stringify([]));
                      setAlertMessage({
                        type: "success",
                        text: "Order placed successfully! Connect with the student seller on campus.",
                      });
                    }}
                  >
                    Place Campus Order
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setCart([]);
                      localStorage.setItem("studentmartCart", JSON.stringify([]));
                    }}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================
          ADD PRODUCT MODAL (TRIGGERED FROM STORE HEADER)
          ========================================= */}
      {isAddProductModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsAddProductModalOpen(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">+ Add Product to Student Store</h3>
            <form onSubmit={handleAddProduct} className="modal-form">
              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. College Bag, Books, Calculator"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 450"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="store-select"
                    style={{ width: "100%", padding: "9px 12px" }}
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                  >
                    <option value="Books">Books</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="College Bags">College Bags</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Essentials">Essentials</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="2"
                  placeholder="Condition, edition, semester details..."
                  value={newProduct.desc}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, desc: e.target.value })
                  }
                />
              </div>

              {/* IMAGE SECTION */}
              <div className="form-group">
                <label>Product Image</label>

                <div className="image-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="upload-icon">📸</div>
                  <p className="upload-text">Click to choose image file</p>
                  <p className="upload-subtext">Supports PNG, JPG, JPEG from your device</p>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={newProduct.image.startsWith("data:") ? "" : newProduct.image}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image: e.target.value })
                    }
                  />
                </div>

                {newProduct.image && (
                  <div className="image-preview-wrapper">
                    <img src={newProduct.image} alt="Product Preview" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      title="Remove image"
                      onClick={() => setNewProduct({ ...newProduct, image: "" })}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          EDIT PROFILE MODAL
          ========================================= */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Profile Information</h3>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="e.g. feb"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="e.g. feb@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="e.g. 1234567890"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                  placeholder="e.g. CSE"
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  value={editForm.year}
                  onChange={(e) =>
                    setEditForm({ ...editForm, year: e.target.value })
                  }
                  placeholder="e.g. 2026"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  placeholder="e.g. Bangalore, Karnataka"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          CHANGE PASSWORD MODAL
          ========================================= */}
      {isPasswordModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
