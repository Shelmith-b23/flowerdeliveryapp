import { useState } from "react";
import api from "../api/axios";


export default function OrderForm({ user, flower, onOrderPlaced }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const placeOrder = async () => {
    if (!quantity || quantity <= 0) {
      setMessage("Please enter a valid quantity.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await api.post("/orders", {
        buyer_id: user.id,
        flower_id: flower.id,
        quantity,
      });
      setMessage("Order placed successfully!");
      setQuantity(1);

      // Notify parent to refresh orders
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      console.error("Order failed:", err);
      setMessage(err.response?.data?.error || "Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form">
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="order-input"
      />
      <button onClick={placeOrder} disabled={loading} className="order-button">
        {loading ? "Placing..." : "Order"}
      </button>
      {message && <div className="order-message">{message}</div>}
    </div>
  );
}
