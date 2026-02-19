import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function FloristDashboard({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flower, setFlower] = useState({
    name: "",
    price: "",
    image_url: "",
    description: ""
  });

  // 1. Initial Load
  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Fetch Orders (Cleanup: Removed "api/" prefix)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("orders/florist");
      // res.data is already parsed by our axios helper
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Add Flower (Cleanup: Removed "api/" prefix)
  const handleAddFlower = async (e) => {
    e.preventDefault();
    try {
      await api.post("flowers", {
        ...flower,
        florist_id: user.id
      });
      alert("Flower added successfully!");
      setFlower({ name: "", price: "", image_url: "", description: "" });
    } catch (err) {
      alert("Failed to add flower. Check console for details.");
    }
  };

  // 4. Update Order Status
  const handleUpdateStatus = async (orderId, currentStatus) => {
    const statusMap = {
      "pending": "processing",
      "processing": "delivered",
      "delivered": "delivered"
    };
    
    const nextStatus = statusMap[currentStatus] || "pending";
    
    try {
      await api.put(`orders/${orderId}/status`, { status: nextStatus });
      fetchOrders(); // Refresh list
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const handleLogout = () => {
    api.setAuthToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="fd-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="fd-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <div>
          <h1>Florist Portal</h1>
          <p>Logged in as: <strong>{user?.shop_name || user?.name}</strong></p>
        </div>
        <button onClick={handleLogout} className="btn-danger">Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginTop: '30px' }}>
        
        {/* Left Column: Add Flower Form */}
        <section className="fd-add-flower">
          <h3>🌸 Add New Flower</h3>
          <form onSubmit={handleAddFlower} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" placeholder="Flower Name" required
              value={flower.name} onChange={(e) => setFlower({...flower, name: e.target.value})}
            />
            <input 
              type="number" placeholder="Price (KSh)" required
              value={flower.price} onChange={(e) => setFlower({...flower, price: e.target.value})}
            />
            <input 
              type="text" placeholder="Image URL"
              value={flower.image_url} onChange={(e) => setFlower({...flower, image_url: e.target.value})}
            />
            <textarea 
              placeholder="Description"
              value={flower.description} onChange={(e) => setFlower({...flower, description: e.target.value})}
            />
            <button type="submit" className="btn-primary">List Flower</button>
          </form>
        </section>

        {/* Right Column: Incoming Orders */}
        <section className="fd-orders">
          <h3>📦 Incoming Orders</h3>
          {loading ? <p>Loading orders...</p> : orders.length === 0 ? <p>No orders yet.</p> : (
            orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Order #{order.id}</strong>
                  <span className={`status-badge ${order.status}`}>{order.status.toUpperCase()}</span>
                </div>
                
                <div style={{ fontSize: '0.9rem', margin: '10px 0' }}>
                  <p>👤 <strong>Buyer:</strong> {order.buyer_name}</p>
                  <p>📍 <strong>Deliver to:</strong> {order.delivery_address}</p>
                </div>

                <div className="order-items" style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.flower_name} x{item.quantity}</span>
                      <span>KSh {item.unit_price}</span>
                    </div>
                  ))}
                </div>

                {order.status !== "delivered" && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, order.status)}
                    style={{ marginTop: '10px', width: '100%', padding: '8px', cursor: 'pointer' }}
                  >
                    Mark as {order.status === "pending" ? "Processing" : "Delivered"}
                  </button>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}