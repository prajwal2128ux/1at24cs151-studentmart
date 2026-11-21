
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, ImagePlus } from "lucide-react";
import { useProducts, API_BASE } from "../context/ProductContext";
import axios from "axios";

const categories = [
  "Electronics", "Books", "Stationery",
  "Accessories", "Clothing", "Other",
];

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateProduct } = useProducts();

  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "", stock: "",
  });
  const [currentImage, setCurrentImage] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    axios.get(`${API_BASE}/api/products/${id}`)
      .then(({ data }) => {
        if (!active) return;
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price ?? "",
          category: data.category || "",
          stock: data.stock ?? "",
        });
        setCurrentImage(data.imageUrl || "");
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Unable to load product.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

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

    if (!form.name.trim() || !form.description.trim() || !categories.includes(form.category)) {
      setError("Enter valid product details.");
      return;
    }

    if (form.price === "" || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (image) data.append("image", image);

    try {
      setSaving(true);
      await updateProduct(id, data);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading">Loading product details...</div>;

  if (error && !form.name) {
    return (
      <div className="products-error">
        <p>{error}</p>
        <Link to="/products" className="back-button">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">INVENTORY MANAGEMENT</span>
          <h1>Edit Product</h1>
          <p>Update product details and save your changes.</p>
        </div>
        <Link to="/products" className="back-button">
          <ArrowLeft size={17} /> Back to Products
        </Link>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="form-section-title">
            <div className="form-icon"><ImagePlus size={22} /></div>
            <div><h2>Product Information</h2><p>Modify your product details.</p></div>
          </div>

          <div className="form-grid">
            <div className="form-field full-width">
              <label>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required maxLength={120} />
            </div>
            <div className="form-field full-width">
              <label>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" required maxLength={2000} />
            </div>
            <div className="form-field">
              <label>Price (₹) *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Available Stock *</label>
              <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
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
            <div><h2>Product Image</h2><p>Keep the current image or upload a replacement.</p></div>
          </div>

          <label className="image-upload-area" htmlFor="edit-product-image">
            {preview || currentImage ? (
              <img
                className="image-preview"
                src={preview || `${API_BASE}${currentImage}`}
                alt="Product preview"
              />
            ) : (
              <Upload size={30} />
            )}
            <strong>Choose a replacement image</strong>
            <span>JPG, PNG or WEBP · Maximum 5 MB</span>
          </label>

          <input
            id="edit-product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
                setError("Select a JPG, PNG or WEBP image under 5 MB.");
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
            <Save size={17} /> {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
