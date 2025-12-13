import { useState } from "react";
import api from "../api/axios";

export default function OrderForm({ user, flower }) {
  const [quantity, setQuantity] = useState(1);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [message, setMessage] = useState("");

  const placeOrder = async () => {
    try {
      await api.post("/orders", { buyer_id: user.id, flower_id: flower.id, quantity, delivery_lat: lat ? parseFloat(lat) : null, delivery_lng: lng ? parseFloat(lng) : null });
      setMessage("Order placed successfully!");
    } catch { setMessage("Error placing order"); }
  };

  return (
    <div style={{ border: "1px solid #ccc", margin: "5px", padding: "10px" }}>
      <h4>Order {flower.name}</h4>
      <input type="number" value={quantity} min="1" onChange={e => setQuantity(e.target.value)} />
      <input type="text" placeholder="Delivery Latitude" value={lat} onChange={e => setLat(e.target.value)} />
      <input type="text" placeholder="Delivery Longitude" value={lng} onChange={e => setLng(e.target.value)} />
      <button onClick={placeOrder}>Place Order</button>
      {message && <p>{message}</p>}
    </div>
  );
}
