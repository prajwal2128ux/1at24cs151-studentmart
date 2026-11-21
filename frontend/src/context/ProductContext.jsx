import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api";

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = async (formData) => {
    const { data } = await api.post("/products", formData);
    await fetchProducts();
    return data;
  };

  const updateProduct = async (id, formData) => {
    const { data } = await api.put(`/products/${id}`, formData);
    await fetchProducts();
    return data;
  };

  const deleteProduct = async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    await fetchProducts();
    return data;
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const value = useContext(ProductContext);
  if (!value) throw new Error("useProducts must be used inside ProductProvider");
  return value;
}