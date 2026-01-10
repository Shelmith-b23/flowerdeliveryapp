import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Cart({ user, logout }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
    setLoading(false);
  }, []);

  // Update cart in localStorage and trigger TopNav update
  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const handleQuantityChange = (id, delta) => {
    const newCart = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    updateCart(newCart);
  };

  const handleRemove = (id) => {
    const newCart = cartItems.filter(item => item.id !== id);
    updateCart(newCart);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty! Redirecting to home page...");
      return navigate("/");
    }

    const address = prompt("Enter delivery address:", "");
    if (!address) return alert("Checkout cancelled: address required.");

    const date = prompt("Enter delivery date (YYYY-MM-DD):", "");
    if (!date) return alert("Checkout cancelled: delivery date required.");

    const paymentMethod = prompt("Choose payment method (M-Pesa / Card):", "M-Pesa");
    if (!paymentMethod) return alert("Checkout cancelled: payment method required.");

    const confirmMsg = `Confirm your order:\nItems: ${cartItems.length}\nDelivery: ${date}\nPayment: ${paymentMethod}\nAddress: ${address}`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.post(`/orders/buyer/${user.id}/checkout`, {
        items: cartItems,
        address,
        delivery_date: date,
        payment_method: paymentMethod
      });

      alert("Order placed successfully!");
      updateCart([]); // Clear cart after checkout
      navigate("/"); // Redirect to home
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Try again.");
    }
  };

  if (loading) return <p>Loading cart...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id} style={{ marginBottom: 12 }}>
              <strong>{item.flower_name}</strong> - KES {item.price} × {item.quantity}
              <div style={{ marginTop: 4 }}>
                <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                <button onClick={() => handleRemove(item.id)} style={{ marginLeft: 8, color: "red" }}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3>Total: KES {cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)}</h3>

      <button
        onClick={handleCheckout}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          borderRadius: 8,
          background: "#8b5e3c",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Checkout
      </button>
    </div>
  );
}
