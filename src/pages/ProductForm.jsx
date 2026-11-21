import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api, { API_BASE } from "../api";
import { useProducts } from "../context/ProductContext";

const categories=["Electronics","Books","Stationery","Accessories","Clothing","Other"];

export default function ProductForm({editing=false}) {
  const {id}=useParams(); const navigate=useNavigate(); const {addProduct,updateProduct}=useProducts();
  const [form,setForm]=useState({name:"",description:"",price:"",category:"",stock:""});
  const [image,setImage]=useState(null); const [oldImage,setOldImage]=useState("");
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [loading,setLoading]=useState(editing);
  useEffect(()=>{
    if(!editing)return;
    api.get(`/products/${id}`).then(({data})=>{setForm({name:data.name,description:data.description,price:data.price,category:data.category,stock:data.stock});setOldImage(data.imageUrl||"");})
      .catch(e=>setError(e.response?.data?.message||"Unable to load product.")).finally(()=>setLoading(false));
  },[editing,id]);
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=async e=>{
    e.preventDefault();setError("");
    if(!form.name.trim()||!form.description.trim()||!form.category||form.price===""||form.stock==="")return setError("Complete all product fields.");
    if(Number(form.price)<0||!Number.isInteger(Number(form.stock))||Number(form.stock)<0)return setError("Enter a valid price and whole-number stock.");
    const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,v));if(image)fd.append("image",image);
    setBusy(true);
    try{if(editing)await updateProduct(id,fd);else await addProduct(fd);navigate("/admin/products");}
    catch(e){setError(e.response?.data?.message||"Unable to save product.");}finally{setBusy(false);}
  };
  if(loading)return <div className="page-loading">Loading product...</div>;
  return <div className="form-page"><div className="page-heading"><div><span className="page-eyebrow">ADMIN INVENTORY</span><h1>{editing?"Edit Product":"Add Product"}</h1><p>{editing?"Update product information.":"Create a marketplace listing."}</p></div><Link to="/admin/products" className="back-button"><ArrowLeft size={16}/> Back</Link></div>
    <form className="product-form" onSubmit={submit}><section className="form-section"><div className="form-grid">
      <div className="form-field full-width"><label>Product name</label><input name="name" value={form.name} onChange={change} required maxLength={120}/></div>
      <div className="form-field full-width"><label>Description</label><textarea name="description" value={form.description} onChange={change} rows="4" required maxLength={2000}/></div>
      <div className="form-field"><label>Price (₹)</label><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} required/></div>
      <div className="form-field"><label>Stock</label><input name="stock" type="number" min="0" step="1" value={form.stock} onChange={change} required/></div>
      <div className="form-field full-width"><label>Category</label><select name="category" value={form.category} onChange={change} required><option value="">Select category</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="form-field full-width"><label>Product image (JPG, PNG, WEBP; max 5 MB)</label>{oldImage&&!image&&<img className="image-preview" src={`${API_BASE}${oldImage}`} alt="Current product"/>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f&&f.size>5*1024*1024){setError("Image must be 5 MB or smaller.");e.target.value="";}else setImage(f||null);}}/></div>
    </div></section>{error&&<div className="form-error">{error}</div>}<div className="form-actions"><button className="save-product-button" disabled={busy}><Save size={16}/>{busy?"Saving...":"Save Product"}</button></div></form>
  </div>;
}