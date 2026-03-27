import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Initialize from localStorage so the bag doesn't empty on refresh
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("flora_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("flora_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (flower) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === flower.id);
      if (existing) {
        return prev.map((item) =>
          item.id === flower.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...flower, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  // Computed Values for the UI
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount, // Now available for TopNav
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}