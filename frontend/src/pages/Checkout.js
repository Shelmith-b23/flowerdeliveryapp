// Ensure this key is the same everywhere
const CART_KEY = "flora_x_storage_key"; 

// Update your addToCart to accept quantity
const addToCart = (flower, quantity = 1) => {
  setCartItems((prev) => {
    const existing = prev.find((item) => item.id === flower.id);
    if (existing) {
      return prev.map((item) =>
        item.id === flower.id ? { ...item, quantity: item.quantity + quantity } : item
      );
    }
    return [...prev, { ...flower, quantity }];
  });
};