import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

export default function FloristDashboard({ user }) {
  const [flowers, setFlowers] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchFlowers = useCallback(async () => {
    const res = await api.get(`/flowers/florist/${user.id}`);
    setFlowers(res.data);
  }, [user.id]);

  const fetchOrders = useCallback(async () => {
    const res = await api.get(`/orders/florist/${user.id}`);
    setOrders(res.data);
  }, [user.id]);

  useEffect(() => {
    fetchFlowers();
    fetchOrders();
  }, [fetchFlowers, fetchOrders]);

  const markDelivered = async (orderId) => {
    await api.put(`/orders/${orderId}`, { status: "delivered" });
    fetchOrders();
  };

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <h2>Your Flowers</h2>
      {flowers.map(f => <p key={f.id}>{f.name} - ${f.price}</p>)}

      <h2>Orders</h2>
      {orders.map(o => (
        <div key={o.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "10px" }}>
          <p>Order #{o.id} - {o.status}</p>
          <p>Buyer ID: {o.buyer_id}</p>
          {o.status !== "delivered" && <button onClick={() => markDelivered(o.id)}>Mark Delivered</button>}
        </div>
      ))}
    </div>
  );
}
