import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import FlowerList from "./FlowerList";
import MessageBox from "./MessageBox";
import LiveTracking from "./LiveTracking";
import './BuyerDashboard.css';

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
    <div className="bdb-container">
      <div className="bdb-header">
        <h1>Welcome, {user.name}</h1>
        <button onClick={api.logout} className="bdb-logout">Logout</button>
      </div>

      <FlowerList user={user} />

      <h2 style={{ marginTop: 18 }}>Your Orders</h2>
      <div className="bdb-orders">
        {orders.map((order) => (
          <div key={order.id} className="bdb-order">
            <div className="meta">
              <div>Order #{order.id}</div>
              <div className="status"><strong>{order.status}</strong></div>
            </div>

            <MessageBox orderId={order.id} userId={user.id} />

            {order.delivery_lat && order.delivery_lng && (
              <LiveTracking order={order} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
