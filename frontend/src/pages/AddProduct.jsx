
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, ImagePlus } from "lucide-react";
import { useProducts } from "../context/ProductContext";

const categories = [
  "Electronics", "Books", "Stationery",
  "Accessories", "Clothing", "Other",
];

export default function AddProduct() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.description.trim() || !form.category) {
      setError("Complete all required product details.");
      return;
    }

    if (form.price === "" || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError("Enter a valid whole-number stock quantity.");
      return;
    }

    if (!image) {
      setError("Please select a product image.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("image", image);

    try {
      setSaving(true);
      await addProduct(data);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">INVENTORY MANAGEMENT</span>
          <h1>Add New Product</h1>
          <p>Add a product to your StudentMart inventory.</p>
        </div>
        <Link to="/products" className="back-button">
          <ArrowLeft size={17} /> Back to Products
        </Link>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="form-section-title">
            <div className="form-icon"><ImagePlus size={22} /></div>
            <div>
              <h2>Product Information</h2>
              <p>Enter the product details below.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field full-width">
              <label>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Enter product name" maxLength={120} required />
            </div>

            <div className="form-field full-width">
              <label>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your product..." rows="4" maxLength={2000} required />
            </div>

            <div className="form-field">
              <label>Price (₹) *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="Enter price" required />
            </div>

            <div className="form-field">
              <label>Available Stock *</label>
              <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} placeholder="Enter quantity" required />
            </div>

            <div className="form-field full-width">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-title">
            <div className="form-icon"><Upload size={22} /></div>
            <div>
              <h2>Product Image</h2>
              <p>JPG, PNG or WEBP. Maximum 5 MB.</p>
            </div>
          </div>

          <label className="image-upload-area" htmlFor="add-product-image">
            {preview ? (
              <img src={preview} alt="Product preview" className="image-preview" />
            ) : (
              <>
                <Upload size={30} />
                <strong>Click to upload product image</strong>
                <span>Choose an image from your computer</span>
              </>
            )}
          </label>

          <input
            id="add-product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                setError("Only JPG, PNG and WEBP images are allowed.");
                event.target.value = "";
                return;
              }
              if (file.size > 5 * 1024 * 1024) {
                setError("Image must be 5 MB or smaller.");
                event.target.value = "";
                return;
              }
              setError("");
              setImage(file);
            }}
          />
        </section>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <Link to="/products" className="cancel-button">Cancel</Link>
          <button className="save-product-button" disabled={saving}>
            <Save size={17} /> {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
