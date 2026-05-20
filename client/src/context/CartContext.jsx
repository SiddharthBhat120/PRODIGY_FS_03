import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ps_cart")) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("ps_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) {
        const newQty = exists.quantity + quantity;
        if (newQty > product.stock) { toast.error("Not enough stock!"); return prev; }
        return prev.map(i => i._id === product._id ? { ...i, quantity: newQty } : i);
      }
      if (quantity > product.stock) { toast.error("Not enough stock!"); return prev; }
      return [...prev, { ...product, quantity }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i._id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i._id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
