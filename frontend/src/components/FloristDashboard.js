// src/pages/FloristDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell 
} from 'recharts';

export default function FloristDashboard({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. DATA INITIALIZATION
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/orders/florist");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 2. ANALYTICS PROCESSING
  const getRevenueData = () => {
    const data = orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) existing.revenue += Number(order.total_price || 0);
      else acc.push({ date, revenue: Number(order.total_price || 0) });
      return acc;
    }, []).slice(-7);
    return data;
  };

  const getTopFlowers = () => {
    const counts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        counts[item.flower_name] = (counts[item.flower_name] || 0) + item.quantity;
      });
    });
    return Object.entries(counts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  };

  // 3. ACTIONS
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const updated = await api.get("/orders/florist");
      setOrders(updated.data || []);
      setSelectedOrder(null);
    } catch (err) {
      alert("Status update failed. Please check connection.");
    }
  };

  const formatKSh = (val) => Number(val || 0).toLocaleString('en-KE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  if (loading) return <div className="empty-state-container"><p className="text-uppercase">Synchronizing Studio...</p></div>;

  return (
    <div className="bd-container-seamless">
      {/* HEADER SECTION */}
      <header className="bd-header-refined" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="text-uppercase">Studio Intelligence</span>
          <h1>{user?.shop_name || "Botanical Studio"}</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/florist/manage-flowers" className="btn-fora btn-outline">Manage Inventory</Link>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="logout-btn-minimal">Sign Out</button>
        </div>
      </header>

      {/* ANALYTICS GRID */}
      <div className="analytics-grid-seamless" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '60px' }}>
        <div className="revenue-chart-wrapper">
          <span className="text-uppercase">Revenue Trend</span>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickFormatter={(v) => `KSh ${v}`} />
              <Tooltip contentStyle={{ borderRadius: '0', border: '1px solid #1A1A1A' }} />
              <Line type="monotone" dataKey="revenue" stroke="#1A1A1A" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="revenue-chart-wrapper">
          <span className="text-uppercase">Top Performers</span>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getTopFlowers()} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={80} axisLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="qty" fill="#1A1A1A" radius={[0, 2, 2, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ORDER MANAGEMENT */}
      <section className="order-management-section">
        <h2 className="section-title-small text-uppercase" style={{ marginBottom: '30px' }}>Active Requests</h2>
        <div className="order-list-seamless">
          {orders.length === 0 ? (
            <p className="bd-email-small">No current orders in the gallery.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="order-row-hairline">
                <div className="order-info">
                  <span className="text-uppercase" style={{ color: '#717171' }}>Order #{order.id}</span>
                  <span className="order-date" style={{ display: 'block' }}>{order.buyer_name} • {new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span className="order-total" style={{ display: 'block', fontWeight: '600' }}>KSh {formatKSh(order.total_price)}</span>
                  <span className={`status-tag ${order.status}`}>{order.status}</span>
                </div>

                <div className="row-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-fora btn-outline" style={{ padding: '8px 12px', fontSize: '10px' }} onClick={() => setSelectedOrder(order)}>Details</button>
                  {order.status !== 'delivered' && (
                    <button className="btn-fora" style={{ padding: '8px 12px', fontSize: '10px' }} 
                      onClick={() => handleUpdateStatus(order.id, order.status === 'pending' ? 'processing' : 'delivered')}>
                      {order.status === 'pending' ? 'Process' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fd-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="fd-modal" onClick={e => e.stopPropagation()}>
            <span className="text-uppercase">Manifest Detail</span>
            <h2 className="empty-title-serif">Order #{selectedOrder.id}</h2>
            <div className="modal-body-content" style={{ margin: '25px 0', borderTop: '1px solid #EEE', paddingTop: '20px' }}>
              <p className="bd-email-small"><strong>Client:</strong> {selectedOrder.buyer_name}</p>
              <p className="bd-email-small"><strong>Phone:</strong> {selectedOrder.buyer_phone}</p>
              <p className="bd-email-small"><strong>Address:</strong> {selectedOrder.delivery_address}</p>
              <div style={{ marginTop: '20px' }}>
                <span className="text-uppercase" style={{ fontSize: '9px' }}>Items</span>
                {selectedOrder.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0' }}>
                    <span>{item.flower_name} (x{item.quantity})</span>
                    <span>KSh {formatKSh(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #1A1A1A', marginTop: '15px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <strong>Total Revenue</strong>
                <strong>KSh {formatKSh(selectedOrder.total_price)}</strong>
              </div>
            </div>
            <button className="btn-fora btn-outline" onClick={() => setSelectedOrder(null)}>Close Manifest</button>
          </div>
        </div>
      )}
    </div>
  );
}