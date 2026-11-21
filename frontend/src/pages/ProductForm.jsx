import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package } from "lucide-react";
import api, { API_BASE } from "../api";
import { useProducts } from "../context/ProductContext";

const categories = ["Electronics", "Books", "Stationery", "Accessories", "Clothing", "Other"];

export default function ProductForm({ editing = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addProduct, updateProduct } = useProducts();
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", stock: "" });
  const [image, setImage] = useState(null);
  const [oldImage, setOldImage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setForm({
          name: data.name || data.title || "",
          description: data.description || data.desc || "",
          price: data.price,
          category: data.category,
          stock: data.stock
        });
        setOldImage(data.imageUrl || data.image || "");
      })
      .catch(e => setError(e.response?.data?.message || "Unable to load product."))
      .finally(() => setLoading(false));
  }, [editing, id]);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.description.trim() || !form.category || form.price === "" || form.stock === "") {
      return setError("Complete all product fields.");
    }
    if (Number(form.price) < 0 || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      return setError("Enter a valid price and whole-number stock.");
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);

    setBusy(true);
    try {
      if (editing) await updateProduct(id, fd);
      else await addProduct(fd);
      navigate("/admin/products");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save product.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="page-loading">Loading product listing...</div>;

  return (
    <div className="form-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">INVENTORY CONTROL</span>
          <h1>{editing ? "Edit Product Listing" : "Add New Campus Listing"}</h1>
          <p>{editing ? "Update item specifications, price, or inventory count." : "List a new textbook, gadget, or essential for student trade."}</p>
        </div>
        <Link to="/admin/products" className="back-button">
          <ArrowLeft size={16} /> Back to Inventory
        </Link>
      </div>

      <form className="product-form" onSubmit={submit}>
        <section className="form-section">
          <div className="form-section-title">
            <div className="form-icon">
              <Package size={22} />
            </div>
            <div>
              <h2>Listing Specifications</h2>
              <p>Basic information displayed to students on the marketplace.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field full-width">
              <label>Product Name</label>
              <input
                name="name"
                value={form.name}
                onChange={change}
                placeholder="e.g., Engineering Mathematics 4th Edition"
                required
                maxLength={120}
              />
            </div>

            <div className="form-field full-width">
              <label>Description & Condition</label>
              <textarea
                name="description"
                value={form.description}
                onChange={change}
                placeholder="Mention condition, edition, brand, notes, or reason for selling..."
                rows="4"
                required
                maxLength={2000}
              />
            </div>

            <div className="form-field">
              <label>Price (₹ Indian Rupee)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={change}
                required
              />
            </div>

            <div className="form-field">
              <label>Available Units (Stock)</label>
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 5"
                value={form.stock}
                onChange={change}
                required
              />
            </div>

            <div className="form-field full-width">
              <label>Campus Category</label>
              <select name="category" value={form.category} onChange={change} required>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-field full-width">
              <label>Product Image (JPG, PNG, WEBP; max 5 MB)</label>
              {oldImage && !image && (
                <div style={{ marginBottom: "10px" }}>
                  <img
                    className="image-preview"
                    src={
                      oldImage.startsWith("data:") || oldImage.startsWith("http")
                        ? oldImage
                        : `${API_BASE}/${oldImage.replace(/^\/+/, "")}`
                    }
                    alt="Current product listing"
                  />
                  <small style={{ display: "block", color: "#64748b", marginTop: "4px" }}>
                    Current listing image
                  </small>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f && f.size > 5 * 1024 * 1024) {
                    setError("Image must be 5 MB or smaller.");
                    e.target.value = "";
                  } else {
                    setImage(f || null);
                  }
                }}
              />
            </div>
          </div>
        </section>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <Link to="/admin/products" className="cancel-button">
            Cancel
          </Link>
          <button className="save-product-button" disabled={busy}>
            <Save size={16} />
            {busy ? "Saving to Catalog..." : editing ? "Save Product Changes" : "Publish to Marketplace"}
          </button>
        </div>
      </form>
    </div>
  );
}
