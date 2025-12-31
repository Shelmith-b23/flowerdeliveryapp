import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Cart({ user, logout }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch cart items for the logged-in buyer
    const fetchCart = async () => {
      try {
        const res = await api.get(`/cart/buyer/${user.id}`);
        setCartItems(res.data);
      } catch (err) {
        console.error("Failed to fetch cart", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user.id]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Prompt buyer for delivery details
    const address = prompt("Enter delivery address:", "");
    if (!address) return alert("Checkout cancelled: address required.");

    const date = prompt("Enter delivery date (YYYY-MM-DD):", "");
    if (!date) return alert("Checkout cancelled: delivery date required.");

    const paymentMethod = prompt("Choose payment method (M-Pesa / Card):", "M-Pesa");
    if (!paymentMethod) return alert("Checkout cancelled: payment method required.");

    // Confirm order summary
    const confirmMsg = `Confirm your order:\nItems: ${cartItems.length}\nDelivery: ${date}\nPayment: ${paymentMethod}\nAddress: ${address}`;
    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;

    try {
      await api.post(`/orders/buyer/${user.id}/checkout`, {
        items: cartItems,
        address,
        delivery_date: date,
        payment_method: paymentMethod
      });

      alert("Order placed successfully!");
      setCartItems([]); // Clear cart after checkout
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
            <li key={item.id}>
              {item.flower_name} - Qty: {item.quantity} - ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
      )}

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
