import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import FlowerList from "./FlowerList";
import MessageBox from "./MessageBox";
import LiveTracking from "./LiveTracking";

export default function BuyerDashboard({ user }) {
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    const res = await api.get(`/orders/buyer/${user.id}`);
    setOrders(res.data);
  }, [user.id]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div>
      {/* 🔐 Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Welcome, {user.name}</h1>
        <button
          onClick={api.logout}
          style={{
            padding: "8px 14px",
            backgroundColor: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <FlowerList user={user} />

      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{ border: "1px solid #ccc", margin: "5px", padding: "10px" }}
        >
          <p>
            Order #{order.id} – <strong>{order.status}</strong>
          </p>

          <MessageBox orderId={order.id} userId={user.id} />

          {order.delivery_lat && order.delivery_lng && (
            <LiveTracking order={order} />
          )}
        </div>
      ))}
    </div>
  );
}
