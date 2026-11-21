import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const KEY = "studentmart-cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(cartItems)); }, [cartItems]);

  const addToCart = (product) => {
    if (!product?._id || Number(product.stock) < 1) throw new Error("Product is out of stock.");
    setCartItems(prev => {
      const found = prev.find(item => item._id === product._id);
      if (found) {
        if (found.quantity >= Number(product.stock)) return prev;
        return prev.map(item => item._id === product._id
          ? { ...item, ...product, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = id => setCartItems(prev => prev.map(item =>
    item._id === id && item.quantity < Number(item.stock)
      ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQuantity = id => setCartItems(prev => prev
    .map(item => item._id === id ? { ...item, quantity: item.quantity - 1 } : item)
    .filter(item => item.quantity > 0));
  const removeFromCart = id => setCartItems(prev => prev.filter(item => item._id !== id));
  const clearCart = () => setCartItems([]);
  const cartCount = useMemo(() => cartItems.reduce((n, x) => n + x.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((n, x) => n + x.price * x.quantity, 0), [cartItems]);

  return <CartContext.Provider value={{ cartItems, cartCount, cartTotal, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart }}>
    {children}
  </CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}