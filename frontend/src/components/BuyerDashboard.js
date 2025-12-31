import { useEffect, useState, useCallback } from "react";
import FlowerList from "./FlowerList";
import MessageBox from "./MessageBox";
import LiveTracking from "./LiveTracking";
import './BuyerDashboard.css'; 

export default function BuyerDashboard({ user, logout }) {
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/orders/buyer/${user.id}`); // or use api.get(`/orders/buyer/${user.id}`)
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
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
        <button onClick={logout} className="bdb-logout">Logout</button>
      </div>

      {/* Flower catalog */}
      <FlowerList user={user} onOrderPlaced={fetchOrders} />

      {/* Orders */}
      <h2 style={{ marginTop: 20 }}>Your Orders</h2>
      <div className="bdb-orders">
        {orders.length === 0 && <p>No orders yet.</p>}
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
