// src/pages/BuyerDashboard.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext"; // Using context for a seamless sync

export default function BuyerDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flowersLoading, setFlowersLoading] = useState(true);
  
  const { cartCount, addToCart } = useCart(); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchFeaturedFlowers();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("orders/buyer");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedFlowers = async () => {
    try {
      const res = await api.get("flowers");
      // Showing a curated selection of 4 for a cleaner grid
      setFlowers(Array.isArray(res.data) ? res.data.slice(0, 4) : []);
    } catch (err) {
      console.error("Failed to fetch flowers:", err);
    } finally {
      setFlowersLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    api.setAuthToken(null);
    navigate("/login");
  };

  // Safe Currency Formatter
  const formatKSh = (val) => Number(val || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="bd-container-seamless">
      {/* HEADER: Minimalist & Clean */}
      <header className="bd-header-refined">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span className="text-uppercase">Member Gallery</span>
            <h1>Welcome, {user?.name?.split(' ')[0] || "Collector"}</h1>
            <p className="bd-email-small">{user?.email}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/cart" className="nav-cart-link">
              BAG ({cartCount})
            </Link>
            <button className="logout-btn-minimal" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </header>

      {/* FEATURED SECTION: Portrait Cards */}
      <section className="bd-main-content" style={{ marginTop: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '30px' }}>
          <h2 className="section-title-small text-uppercase">New Accessions</h2>
          <Link to="/categories" className="action-link">View All</Link>
        </div>

        {flowersLoading ? (
          <p className="text-uppercase">Opening the vault...</p>
        ) : (
          <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '40px' }}>
            {flowers.map(flower => (
              <div key={flower.id} className="flower-card-hairline">
                <div className="flower-img-wrapper" style={{ height: '380px', background: '#F9F9F9' }}>
                  <img 
                    src={flower.image_url || "https://placehold.co/400x600"} 
                    alt={flower.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div className="flower-details" style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 className="empty-title-serif" style={{ fontSize: '1.2rem' }}>{flower.name}</h3>
                    <span className="order-total">KSh {formatKSh(flower.price)}</span>
                  </div>
                  <button 
                    className="btn-fora btn-outline" 
                    style={{ width: '100%', marginTop: '15px', fontSize: '10px' }}
                    onClick={() => addToCart(flower)}
                  >
                    Add to Selection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ORDERS SECTION: Hairline List */}
      <section className="bd-orders-section" style={{ marginTop: '80px', borderTop: '1px solid #EEE', paddingTop: '40px' }}>
        <h2 className="text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.1em', marginBottom: '30px' }}>Order History</h2>
        
        {loading ? (
          <p className="text-uppercase">Retrieving History...</p>
        ) : orders.length === 0 ? (
          <p className="bd-email-small">Your history is currently a blank canvas.</p>
        ) : (
          <div className="order-list-seamless">
            {orders.map(order => (
              <div key={order.id} className="order-row-hairline">
                <div className="order-info">
                  <span className="text-uppercase" style={{ fontSize: '10px', color: '#717171' }}>Order #{order.id}</span>
                  <span className="order-date" style={{ display: 'block' }}>
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-tag ${order.status}`}>{order.status}</span>
                  <span className="order-total" style={{ display: 'block', marginTop: '5px', fontWeight: '600' }}>
                    KSh {formatKSh(order.total_price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}