import "../style/dashboard.css";
import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ role: propRole, initialTab = "profile" }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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

  // Fallback default products
  const defaultProducts = [
    {
      id: "1",
      title: "Engineering Mathematics Textbook",
      price: 450,
      category: "Books",
      desc: "VTU 3rd & 4th sem mathematics textbook in mint condition with solved papers.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "2",
      title: "Scientific Calculator FX-991EX",
      price: 850,
      category: "Gadgets",
      desc: "Casio Classwiz calculator with solar battery, accepted in all semester exams.",
      image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "3",
      title: "Campus College Backpack",
      price: 650,
      category: "College Bags",
      desc: "Durable water-resistant college bag with 3 compartments & padded laptop sleeve.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "4",
      title: "Lab Coat & Safety Apron (Size M)",
      price: 299,
      category: "Uniform",
      desc: "100% white cotton lab apron suitable for Chemistry and Physics lab experiments.",
      image: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "5",
      title: "Engineering Drawing Kit & Drafter",
      price: 550,
      category: "Stationery",
      desc: "Mini drafter with scale, clamps, sheet holder, and protective carrying case.",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "6",
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

  // Add Product form state
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    category: "Books",
    desc: "",
    image: "",
  });

  // Fetch live products from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          localStorage.setItem("studentmartProducts", JSON.stringify(data.products));
        }
      }
    } catch (err) {
      console.warn("Could not reach products API, using stored products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch current user profile
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

  // Determine effective user role
  const effectiveRole =
    propRole ||
    user?.role ||
    (() => {
      try {
        const u = localStorage.getItem("studentmartUser");
        return u ? JSON.parse(u).role : "customer";
      } catch {
        return "customer";
      }
    })() ||
    "customer";

  const isAdmin = effectiveRole === "admin";

  // Prevent role-tab mismatch
  useEffect(() => {
    if (isAdmin && activeTab === "cart") {
      setActiveTab("view-products");
    } else if (!isAdmin && activeTab === "add-products") {
      setActiveTab("view-products");
    }
  }, [isAdmin, activeTab]);

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

  // Image Upload Handler (reads as Base64 data URL)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAlertMessage({ type: "error", text: "Please select an image file (PNG, JPG, JPEG)." });
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

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAlertMessage({ type: "error", text: "Please select an image file (PNG, JPG, JPEG)." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditingProduct((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Add Product Handler (Admin only)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setAlertMessage({ type: "error", text: "Only administrators can add products." });
      return;
    }

    if (!newProduct.title.trim()) {
      setAlertMessage({ type: "error", text: "Please enter a product title." });
      return;
    }

    if (newProduct.price === "" || isNaN(Number(newProduct.price))) {
      setAlertMessage({ type: "error", text: "Please enter a valid price." });
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

    const itemPayload = {
      title: newProduct.title.trim(),
      price: Number(newProduct.price),
      category: newProduct.category || "Books",
      desc: newProduct.desc.trim() || "Available for campus pickup.",
      image: newProduct.image || fallbackImage,
    };

    try {
      const token = localStorage.getItem("studentmartToken");
      if (!token) {
        throw new Error("Admin session expired. Please log in again.");
      }

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to publish product.");
      }

      const savedItem = data.product || { ...itemPayload, id: Date.now().toString() };
      const updated = [savedItem, ...products.filter((p) => (p.id || p._id) !== (savedItem.id || savedItem._id))];
      setProducts(updated);
      localStorage.setItem("studentmartProducts", JSON.stringify(updated));

      setNewProduct({
        title: "",
        price: "",
        category: "Books",
        desc: "",
        image: "",
      });

      setAlertMessage({
        type: "success",
        text: `"${savedItem.title}" published to Student Store!`,
      });

      setActiveTab("view-products");
    } catch (err) {
      console.error("Add Product Error:", err);
      setAlertMessage({ type: "error", text: err.message || "Failed to add product." });
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (product) => {
    setEditingProduct({
      id: product.id || product._id,
      title: product.title || product.name || "",
      price: product.price !== undefined ? product.price : "",
      category: product.category || "Books",
      desc: product.desc || product.description || "",
      image: product.image || "",
    });
  };

  // Save Edited Product (Admin only)
  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingProduct) return;

    try {
      const token = localStorage.getItem("studentmartToken");
      const res = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingProduct.title.trim(),
          price: Number(editingProduct.price),
          category: editingProduct.category,
          desc: editingProduct.desc.trim(),
          image: editingProduct.image,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update product.");
      }

      const updatedItem = data.product || editingProduct;
      const updated = products.map((p) =>
        (p.id === editingProduct.id || p._id === editingProduct.id) ? { ...p, ...updatedItem } : p
      );
      setProducts(updated);
      localStorage.setItem("studentmartProducts", JSON.stringify(updated));

      setAlertMessage({
        type: "success",
        text: `"${updatedItem.title}" updated successfully!`,
      });
      setEditingProduct(null);
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message || "Failed to update product." });
    }
  };

  // Delete Product Handler (Admin only)
  const handleDeleteProduct = async (productId) => {
    if (!isAdmin) {
      setAlertMessage({ type: "error", text: "Only administrators can delete products." });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product from the store?")) {
      return;
    }

    try {
      const token = localStorage.getItem("studentmartToken");
      if (token) {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok && res.status !== 404) {
          throw new Error(data.message || "Failed to delete product from server.");
        }
      }

      const updated = products.filter((p) => p.id !== productId && p._id !== productId);
      setProducts(updated);
      localStorage.setItem("studentmartProducts", JSON.stringify(updated));

      setAlertMessage({
        type: "success",
        text: "Product deleted from Student Store.",
      });
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message || "Failed to delete product." });
    }
  };

  // Add to Cart Handler (Customer only)
  const addToCart = (product) => {
    if (isAdmin) {
      setAlertMessage({ type: "error", text: "Administrators cannot add items to cart." });
      return;
    }
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
    const title = (item.title || item.name || "").toLowerCase();
    const desc = (item.desc || item.description || "").toLowerCase();
    const cat = (item.category || "").toLowerCase();

    const matchesSearch =
      term === "" ||
      title.includes(term) ||
      desc.includes(term) ||
      cat.includes(term);

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
          LEFT SIDEBAR (ROLE-BASED VIEW)
          ========================================= */}
      <aside className="portal-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">S</div>
          <div>
            <span className="brand-title">StudentMart</span>
          </div>
        </div>

        {/* Menu title */}
        <div className="sidebar-menu-title">
          {isAdmin ? "ADMIN MENU" : "MAIN MENU"}
        </div>

        {/* Navigation list matching requirements */}
        <nav className="sidebar-nav">
          {/* 1. Profile (Customer & Admin) */}
          <button
            type="button"
            className={`sidebar-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="sidebar-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            Profile
          </button>

          {/* 2. Add Products (Admin ONLY) */}
          {isAdmin && (
            <button
              type="button"
              className={`sidebar-item ${activeTab === "add-products" ? "active" : ""}`}
              onClick={() => setActiveTab("add-products")}
            >
              <span className="sidebar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </span>
              Add Products
            </button>
          )}

          {/* 3. View Products (Customer & Admin) */}
          <button
            type="button"
            className={`sidebar-item ${activeTab === "view-products" || activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("view-products")}
          >
            <span className="sidebar-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </span>
            View Products
          </button>

          {/* 4. Shopping Cart (Customer ONLY) */}
          {!isAdmin && (
            <button
              type="button"
              className={`sidebar-item ${activeTab === "cart" ? "active" : ""}`}
              onClick={() => setActiveTab("cart")}
            >
              <span className="sidebar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </span>
              Shopping Cart {cart.length > 0 && `(${cart.length})`}
            </button>
          )}
        </nav>

        {/* Logout at bottom */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span className="sidebar-icon">
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
            1. PROFILE VIEW
            ========================================= */}
        {activeTab === "profile" && (
          <div>
            <header className="portal-header">
              <h1>
                Welcome, {displayName}! 👋
              </h1>
              <p>
                {isAdmin
                  ? "Manage your StudentMart Administrator profile."
                  : "Manage your StudentMart student profile here."}
              </p>
            </header>

            <div className="profile-card-container">
              <div className="profile-box">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h2 className="profile-box-title" style={{ margin: 0 }}>My Profile</h2>
                  <span className={`role-badge ${isAdmin ? "admin" : "customer"}`}>
                    {isAdmin ? "Store Admin" : "Student"}
                  </span>
                </div>

                {/* Avatar circle with initial */}
                <div className="profile-avatar-circle">
                  <span>{avatarLetter}</span>
                </div>

                {/* Profile Details List */}
                <div className="profile-details-list">
                  <div className="profile-detail-row">
                    <span className="profile-label">Name</span>
                    <span className="profile-value">{displayName}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-label">Email</span>
                    <span className="profile-value">{displayEmail}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-label">Role</span>
                    <span className="profile-value" style={{ textTransform: "capitalize", fontWeight: "700", color: isAdmin ? "#7c3aed" : "#2563eb" }}>
                      {effectiveRole}
                    </span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-label">Phone</span>
                    <span className="profile-value">{displayPhone}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-label">Department</span>
                    <span className="profile-value">{displayDepartment}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-label">Year</span>
                    <span className="profile-value">{displayYear}</span>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-label">Address</span>
                    <span className="profile-value">{displayAddress}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn-profile-edit"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    className="btn-profile-password"
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
            2. VIEW PRODUCTS (STUDENT STORE)
            ========================================= */}
        {(activeTab === "view-products" || activeTab === "products") && (
          <div className="store-container">
            {/* Store Header Top Bar */}
            <div className="store-header">
              <div>
                <h2 className="store-title">Student Store</h2>
                <p className="store-subtitle">
                  {isAdmin
                    ? "Manage campus products, inventory, and listings"
                    : "Browse and buy used textbooks, calculators, bags, and essentials"}
                </p>
              </div>

              <div className="store-header-actions">
                {/* Cart button ONLY for Customer */}
                {!isAdmin && (
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
                    Cart {cart.length > 0 && `(${cart.length})`}
                  </button>
                )}

                {/* + Add Product button ONLY for Admin - switches directly to Add Products tab */}
                {isAdmin && (
                  <button
                    type="button"
                    className="btn-store-add"
                    onClick={() => setActiveTab("add-products")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    + Add Product
                  </button>
                )}
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
                <option value="All">All Categories</option>
                <option value="Books">Books</option>
                <option value="Gadgets">Gadgets</option>
                <option value="College Bags">College Bags</option>
                <option value="Uniform">Uniform</option>
                <option value="Stationery">Stationery</option>
                <option value="Essentials">Essentials</option>
                <option value="Other">Other</option>
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
                  <div key={item.id || item._id} className="store-card">
                    {/* Image Section */}
                    <div className="store-card-img-wrapper">
                      <img
                        src={item.image}
                        alt={item.title || item.name}
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
                      <h3 className="store-card-title">{item.title || item.name}</h3>
                      <p className="store-card-desc">{item.desc || item.description}</p>

                      <div className="store-card-footer">
                        <span className="store-card-price">₹{item.price}</span>

                        {/* Customer: Add to Cart */}
                        {!isAdmin ? (
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
                        ) : (
                          /* Admin: Edit and Delete */
                          <div className="store-card-admin-actions">
                            <button
                              type="button"
                              className="btn-card-edit"
                              onClick={() => handleOpenEditProduct(item)}
                              title="Edit this product"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-card-delete"
                              onClick={() => handleDeleteProduct(item.id || item._id)}
                              title="Delete this product"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            3. ADD PRODUCTS VIEW (ADMIN ONLY)
            ========================================= */}
        {isAdmin && activeTab === "add-products" && (
          <div className="store-container">
            <div className="store-header">
              <div>
                <h2 className="store-title">+ Add Product to Student Store</h2>
                <p className="store-subtitle">
                  Create and publish a new item to the campus marketplace
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab("view-products")}
              >
                ← View Store
              </button>
            </div>

            <hr className="store-divider" />

            <form
              onSubmit={handleAddProduct}
              className="modal-form"
              style={{ maxWidth: "620px" }}
            >
              <div className="form-group">
                <label>Product Name / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering Mathematics Textbook, FX-991EX Calculator"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
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
                    style={{ width: "100%", padding: "10px 12px" }}
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                  >
                    <option value="Books">Books</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="College Bags">College Bags</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Essentials">Essentials</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Enter details about condition, semester, edition, notes..."
                  value={newProduct.desc}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, desc: e.target.value })
                  }
                />
              </div>

              {/* IMAGE SECTION */}
              <div className="form-group">
                <label>Product Image</label>

                {/* Local file upload */}
                <div className="image-upload-zone">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                  />
                  <div className="upload-icon">📸</div>
                  <p className="upload-text">Click to choose image file</p>
                  <p className="upload-subtext">Supports PNG, JPG, JPEG from your device</p>
                </div>

                {/* URL input */}
                <div style={{ marginTop: "8px" }}>
                  <input
                    type="url"
                    placeholder="Or paste an image web URL (https://...)"
                    value={newProduct.image.startsWith("data:") ? "" : newProduct.image}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image: e.target.value })
                    }
                  />
                </div>

                {/* Live image preview */}
                {newProduct.image && (
                  <div className="image-preview-wrapper" style={{ marginTop: "10px" }}>
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

              <div style={{ marginTop: "16px" }}>
                <button type="submit" className="btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
                  Publish to Student Store
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================
            4. SHOPPING CART VIEW (CUSTOMER ONLY)
            ========================================= */}
        {!isAdmin && activeTab === "cart" && (
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
                          alt={item.title || item.name}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <strong style={{ display: "block", color: "#0f172a" }}>
                            {item.title || item.name}
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
          EDIT PRODUCT MODAL (ADMIN ONLY)
          ========================================= */}
      {isAdmin && editingProduct && (
        <div
          className="modal-backdrop"
          onClick={() => setEditingProduct(null)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Product</h3>
            <form onSubmit={handleSaveEditProduct} className="modal-form">
              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, title: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="store-select"
                    style={{ width: "100%", padding: "9px 12px" }}
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                  >
                    <option value="Books">Books</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="College Bags">College Bags</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Essentials">Essentials</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editingProduct.desc}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, desc: e.target.value })
                  }
                />
              </div>

              {/* IMAGE SECTION */}
              <div className="form-group">
                <label>Product Image</label>

                <div className="image-upload-zone">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleEditImageUpload}
                  />
                  <div className="upload-icon">📸</div>
                  <p className="upload-text">Click to choose image file</p>
                  <p className="upload-subtext">Supports PNG, JPG, JPEG from your device</p>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={editingProduct.image.startsWith("data:") ? "" : editingProduct.image}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, image: e.target.value })
                    }
                  />
                </div>

                {editingProduct.image && (
                  <div className="image-preview-wrapper" style={{ marginTop: "8px" }}>
                    <img src={editingProduct.image} alt="Product Preview" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      title="Remove image"
                      onClick={() => setEditingProduct({ ...editingProduct, image: "" })}
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
                  onClick={() => setEditingProduct(null)}
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
