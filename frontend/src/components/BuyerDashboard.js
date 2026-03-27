// src/pages/BuyerDashboard.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

export default function BuyerDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flowersLoading, setFlowersLoading] = useState(true);
  
  // Connect to your new CartContext
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
      // Curating the top 4 for a clean, editorial grid
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

  // Safe Currency Formatter (Prevents .toFixed errors)
  const formatKSh = (val) => Number(val || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="bd-container-seamless">
      {/* HEADER: Minimalist Editorial Style */}
      <header className="bd-header-refined">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span className="text-uppercase" style={{ fontSize: '10px', letterSpacing: '2px' }}>Member Gallery</span>
            <h1 style={{ margin: '10px 0' }}>Welcome, {user?.name?.split(' ')[0] || "Collector"}</h1>
            <p className="bd-email-small" style={{ color: '#717171' }}>{user?.email}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <Link to="/cart" className="nav-cart-link" style={{ fontWeight: '600', textDecoration: 'none', color: '#1A1A1A' }}>
              BAG ({cartCount})
            </Link>
            <button className="logout-btn-minimal" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </header>

      {/* FEATURED SECTION: Portrait cards for high-end feel */}
      <section className="bd-main-content" style={{ marginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
          <h2 className="section-title-small text-uppercase">New Accessions</h2>
          <Link to="/categories" className="action-link" style={{ fontSize: '12px' }}>View All Collections</Link>
        </div>

        {flowersLoading ? (
          <p className="text-uppercase" style={{ textAlign: 'center', padding: '50px' }}>Syncing with the Garden...</p>
        ) : (
          <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
            {flowers.map(flower => (
              <div key={flower.id} className="flower-card-hairline">
                <div className="flower-img-wrapper" style={{ height: '420px', background: '#F9F9F9', overflow: 'hidden' }}>
                  <img 
                    src={flower.image_url || "https://placehold.co/400x600"} 
                    alt={flower.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                  />
                </div>
                <div className="flower-details" style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 className="empty-title-serif" style={{ fontSize: '1.4rem', marginBottom: '5px' }}>{flower.name}</h3>
                      <span className="text-uppercase" style={{ fontSize: '9px', color: '#717171' }}>{flower.category || 'Seasonal'}</span>
                    </div>
                    <span className="order-total" style={{ fontWeight: '600' }}>KSh {formatKSh(flower.price)}</span>
                  </div>
                  
                  {/* THE BUTTON: Now connected to useCart() */}
                  <button 
                    className="btn-fora btn-outline" 
                    style={{ width: '100%', marginTop: '20px', fontSize: '10px', padding: '12px' }}
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

      {/* ORDERS SECTION: Minimalist List */}
      <section className="bd-orders-section" style={{ marginTop: '100px', borderTop: '1px solid #EEE', paddingTop: '60px' }}>
        <h2 className="text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.2em', marginBottom: '40px', color: '#1A1A1A' }}>Past Acquisitions</h2>
        
        {loading ? (
          <p className="text-uppercase">Retrieving Archives...</p>
        ) : orders.length === 0 ? (
          <p className="bd-email-small">Your curation history is currently empty.</p>
        ) : (
          <div className="order-list-seamless">
            {orders.map(order => (
              <div key={order.id} className="order-row-hairline" style={{ display: 'flex', justifyContent: 'space-between', padding: '25px 0', borderBottom: '1px solid #F0F0F0' }}>
                <div className="order-info">
                  <span className="text-uppercase" style={{ fontSize: '9px', color: '#717171', display: 'block', marginBottom: '5px' }}>Order Ref: #{order.id}</span>
                  <span className="order-date" style={{ fontSize: '14px' }}>
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-tag ${order.status}`} style={{ fontSize: '10px' }}>{order.status.toUpperCase()}</span>
                  <span className="order-total" style={{ display: 'block', marginTop: '8px', fontWeight: '600' }}>
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