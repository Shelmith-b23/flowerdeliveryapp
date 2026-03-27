// src/pages/FloristDashboard.js
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function FloristDashboard({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) api.setAuthToken(token);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/florist");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Status update failed.");
    }
  };

  // --- ANALYTICS LOGIC (No Libraries Needed) ---
  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total_price || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  // Get top 3 flowers by counting occurrences in orders
  const flowerCounts = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      flowerCounts[item.flower_name] = (flowerCounts[item.flower_name] || 0) + item.quantity;
    });
  });
  const topStems = Object.entries(flowerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const formatKSh = (val) => Number(val || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="bd-container-seamless">
      <header className="bd-header-refined">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="text-uppercase" style={{ fontSize: '10px' }}>Studio Management</span>
            <h1>{user.shop_name || "Botanical Studio"}</h1>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/florist/manage-flowers" className="btn-fora btn-outline">Inventory</Link>
            <button className="logout-btn-minimal" onClick={() => { localStorage.clear(); navigate("/login"); }}>Sign Out</button>
          </div>
        </div>
      </header>

      {/* LIGHTWEIGHT ANALYTICS GRID */}
      <section className="simple-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>
        
        {/* Revenue Box */}
        <div style={{ padding: '30px', border: '1px solid #1A1A1A', background: '#1A1A1A', color: '#FFF' }}>
          <span className="text-uppercase" style={{ fontSize: '9px', opacity: 0.8 }}>Total Revenue</span>
          <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>KSh {formatKSh(totalRevenue)}</h2>
          <div style={{ height: '4px', width: '100%', background: '#333', marginTop: '15px' }}>
            <div style={{ height: '100%', width: '70%', background: '#FFF' }}></div> {/* Visual progress bar */}
          </div>
        </div>

        {/* Top Stems Box (CSS-based Bar Chart) */}
        <div style={{ padding: '30px', border: '1px solid #EEE' }}>
          <span className="text-uppercase" style={{ fontSize: '9px', color: '#717171' }}>Bestselling Stems</span>
          <div style={{ marginTop: '15px' }}>
            {topStems.length > 0 ? topStems.map(([name, qty]) => (
              <div key={name} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span>{name}</span>
                  <span>{qty} Sold</span>
                </div>
                <div style={{ height: '2px', width: '100%', background: '#EEE' }}>
                  <div style={{ height: '100%', width: `${Math.min(qty * 10, 100)}%`, background: '#1A1A1A' }}></div>
                </div>
              </div>
            )) : <p className="bd-email-small">No sales data yet.</p>}
          </div>
        </div>

        {/* Status Box */}
        <div style={{ padding: '30px', border: '1px solid #EEE' }}>
          <span className="text-uppercase" style={{ fontSize: '9px', color: '#717171' }}>Order Pulse</span>
          <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{pendingOrders} <span style={{ fontSize: '14px', fontWeight: '400' }}>New</span></h2>
          <p className="bd-email-small">{orders.length} total curated orders.</p>
        </div>

      </section>

      {/* ORDER LIST */}
      <section style={{ marginTop: '60px' }}>
        <h2 className="text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.2em', marginBottom: '30px' }}>Live Manifests</h2>
        <div className="order-list-seamless">
          {orders.map(order => (
            <div key={order.id} className="order-row-hairline" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #F5F5F5' }}>
              <div>
                <span className="text-uppercase" style={{ fontSize: '9px', color: '#717171' }}>#{order.id}</span>
                <p style={{ margin: '5px 0', fontWeight: '600' }}>{order.buyer_name}</p>
                <span className={`status-tag ${order.status}`}>{order.status}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '600', marginBottom: '10px' }}>KSh {formatKSh(order.total_price)}</p>
                {order.status !== 'delivered' && (
                  <button 
                    className="btn-fora btn-outline" 
                    style={{ fontSize: '10px', padding: '5px 10px' }}
                    onClick={() => handleUpdateStatus(order.id, order.status === 'pending' ? 'processing' : 'delivered')}
                  >
                    Mark {order.status === 'pending' ? 'Processing' : 'Delivered'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}