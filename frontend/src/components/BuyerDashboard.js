import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function BuyerDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flowersLoading, setFlowersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchFeaturedFlowers();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/buyer");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedFlowers = async () => {
    try {
      const res = await api.get("/flowers");
      // Get up to 6 featured flowers for display
      setFlowers(res.data.slice(0, 6));
    } catch (err) {
      console.error("Failed to fetch flowers:", err);
    } finally {
      setFlowersLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#ffc107";
      case "processing": return "#2196F3";
      case "delivered": return "#4CAF50";
      default: return "#999";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return "⏳";
      case "processing": return "🚚";
      case "delivered": return "✅";
      default: return "❓";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="bd-container">
      {/* Header */}
      <div className="bd-header">
        <div>
          <h1>👋 Welcome, {user?.name}!</h1>
          <p className="bd-email">{user?.email}</p>
        </div>
        <button className="btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Navigation */}
      <div className="bd-nav">
        <Link to="/browse-flowers" className="btn-secondary">
          🌸 Browse Flowers
        </Link>
        <Link to="/checkout" className="btn-primary">
          🛒 Checkout
        </Link>
      </div>

      {/* Featured Flowers Section */}
      <div className="bd-featured-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>✨ Featured Flowers from Our Florists</h2>
          <Link to="/browse-flowers" className="btn-secondary" style={{ textDecoration: "none" }}>
            View All
          </Link>
        </div>

        {flowersLoading ? (
          <p className="bd-loading">Loading featured flowers...</p>
        ) : flowers.length === 0 ? (
          <p className="bd-empty">No flowers available at the moment.</p>
        ) : (
          <div className="bd-featured-grid">
            {flowers.map(flower => (
              <div key={flower.id} className="bd-featured-card">
                <div className="bd-featured-image">
                  <img
                    src={flower.image_url || "https://placehold.co/200?text=No+Image"}
                    alt={flower.name}
                  />
                </div>
                <div className="bd-featured-info">
                  <h4>{flower.name}</h4>
                  <p className="bd-featured-shop">🌺 {flower.florist?.shop_name || flower.shop_name}</p>
                  {flower.description && (
                    <p className="bd-featured-desc">{flower.description.substring(0, 50)}...</p>
                  )}
                  <div className="bd-featured-footer">
                    <span className="bd-featured-price">KSh {flower.price}</span>
                    <Link 
                      to="/browse-flowers" 
                      className="bd-featured-btn"
                      style={{ textDecoration: "none" }}
                    >
                      👀 View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="bd-orders-section">
        <h2>📦 My Orders</h2>

        {loading ? (
          <p className="bd-loading">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="bd-empty">
            <p>You haven't placed any orders yet.</p>
            <Link to="/browse-flowers" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bd-orders-grid">
            {orders.map(order => (
              <div key={order.id} className="bd-order-card">
                {/* Order Header */}
                <div className="bd-order-header">
                  <div>
                    <h4>Order #{order.id}</h4>
                    <p className="bd-order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="bd-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)} {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Payment Status */}
                <div className="bd-payment-status">
                  <span className={`bd-payment-badge ${order.paid ? "paid" : "pending"}`}>
                    {order.paid ? "✅ Paid" : "⏳ Pending Payment"}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="bd-info-box">
                  <label>📍 Delivery Address</label>
                  <p>{order.delivery_address}</p>
                </div>

                {/* Items */}
                <div className="bd-items">
                  <label>🌸 Items</label>
                  {order.items && order.items.length > 0 ? (
                    <div>
                      {order.items.map((item, index) => (
                        <div key={`${order.id}-item-${index}`} className="bd-item">
                          <span>{item.flower_name}</span>
                          <span className="bd-item-qty">x{item.quantity}</span>
                          <span className="bd-item-price">KSh {(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--muted-gray)" }}>No items in this order</p>
                  )}
                </div>

                {/* Total */}
                <div className="bd-order-total">
                  <span>Total:</span>
                  <span style={{ fontSize: "1.3em", fontWeight: "700", color: "var(--primary-pink)" }}>
                    KSh {order.total_price.toFixed(2)}
                  </span>
                </div>

                {/* Details Button */}
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedOrder(order)}
                  style={{ width: "100%", marginTop: "15px" }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="bd-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="bd-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="bd-modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>

            <h3>Order #{selectedOrder.id} Details</h3>

            <div className="bd-modal-section">
              <h4>Status & Payment</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ fontSize: "0.9em", color: "var(--muted-gray)" }}>Order Status</label>
                  <p style={{ fontWeight: "600", color: getStatusColor(selectedOrder.status) }}>
                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: "0.9em", color: "var(--muted-gray)" }}>Payment</label>
                  <p style={{ fontWeight: "600", color: selectedOrder.paid ? "var(--success)" : "var(--warning)" }}>
                    {selectedOrder.paid ? "✅ Paid" : "⏳ Pending"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bd-modal-section">
              <h4>Delivery Information</h4>
              <p><strong>Phone:</strong> {selectedOrder.buyer_phone}</p>
              <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
            </div>

            <div className="bd-modal-section">
              <h4>Order Items</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div>
                  {selectedOrder.items.map((item, index) => (
                    <div key={`order-${selectedOrder.id}-item-${index}`} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-gray)" }}>
                      <div>
                        <p style={{ margin: "0 0 5px 0", fontWeight: "600" }}>{item.flower_name}</p>
                        <p style={{ margin: "0", fontSize: "0.9em", color: "var(--muted-gray)" }}>by {item.florist_name}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: "0", fontWeight: "600" }}>x{item.quantity}</p>
                        <p style={{ margin: "0", color: "var(--primary-pink)", fontWeight: "600" }}>KSh {(item.unit_price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No items</p>
              )}
            </div>

            <div className="bd-modal-section">
              <div style={{ borderTop: "2px solid var(--primary-pink)", paddingTop: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2em", fontWeight: "700" }}>
                  <span>Total:</span>
                  <span style={{ color: "var(--primary-pink)" }}>KSh {selectedOrder.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              className="btn-primary"
              onClick={() => setSelectedOrder(null)}
              style={{ width: "100%", marginTop: "20px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        .bd-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-lg);
        }

        .bd-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, var(--accent-light) 0%, var(--accent-soft) 100%);
          border-radius: 12px;
        }

        .bd-header h1 {
          margin: 0 0 5px 0;
          color: var(--primary-pink);
        }

        .bd-email {
          margin: 0;
          color: var(--muted-gray);
          font-size: 0.95em;
        }

        .bd-nav {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
        }

        .bd-featured-section {
          background: white;
          padding: var(--spacing-lg);
          border-radius: 8px;
          margin-bottom: var(--spacing-xl);
          border-left: 4px solid var(--primary-pink);
        }

        .bd-featured-section h2 {
          margin: 0 0 20px 0;
          color: var(--primary-pink);
          font-size: 1.3em;
        }

        .bd-featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 15px;
        }

        .bd-featured-card {
          background: var(--accent-soft);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid var(--border-gray);
        }

        .bd-featured-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(216, 27, 96, 0.15);
          border-color: var(--primary-pink);
        }

        .bd-featured-image {
          width: 100%;
          height: 150px;
          overflow: hidden;
          background: #f0f0f0;
        }

        .bd-featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .bd-featured-info {
          padding: 12px;
        }

        .bd-featured-info h4 {
          margin: 0 0 5px 0;
          font-size: 0.95em;
          color: var(--dark-gray);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bd-featured-shop {
          margin: 0 0 5px 0;
          font-size: 0.8em;
          color: var(--muted-gray);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bd-featured-desc {
          margin: 0 0 8px 0;
          font-size: 0.75em;
          color: var(--muted-gray);
          line-height: 1.3;
        }

        .bd-featured-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bd-featured-price {
          font-weight: 700;
          color: var(--primary-pink);
          font-size: 0.95em;
        }

        .bd-featured-btn {
          background: var(--primary-pink);
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 0.8em;
          cursor: pointer;
          display: inline-block;
          transition: background-color 0.3s;
        }

        .bd-featured-btn:hover {
          background: #c2185b;
        }

        .bd-orders-section {
          margin-top: var(--spacing-xl);
        }

        .bd-orders-section h2 {
          margin-bottom: var(--spacing-lg);
          color: var(--dark-gray);
        }

        .bd-loading, .bd-empty {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--muted-gray);
        }

        .bd-empty {
          background: var(--accent-soft);
          border-radius: 8px;
        }

        .bd-empty p {
          margin-bottom: var(--spacing-md);
        }

        .bd-orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .bd-order-card {
          background: white;
          border: 1px solid var(--border-gray);
          border-radius: 8px;
          padding: var(--spacing-lg);
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .bd-order-card:hover {
          box-shadow: 0 8px 16px rgba(255, 107, 157, 0.15);
          transform: translateY(-2px);
        }

        .bd-order-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--border-gray);
        }

        .bd-order-header h4 {
          margin: 0 0 5px 0;
          color: var(--dark-gray);
        }

        .bd-order-date {
          margin: 0;
          font-size: 0.85em;
          color: var(--muted-gray);
        }

        .bd-status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 0.85em;
          font-weight: 600;
          white-space: nowrap;
        }

        .bd-payment-status {
          margin-bottom: var(--spacing-md);
        }

        .bd-payment-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .bd-payment-badge.paid {
          background: #e8f5e9;
          color: var(--success);
        }

        .bd-payment-badge.pending {
          background: #fff3e0;
          color: var(--warning);
        }

        .bd-info-box {
          background: var(--accent-soft);
          padding: var(--spacing-md);
          border-radius: 6px;
          margin-bottom: var(--spacing-md);
        }

        .bd-info-box label {
          display: block;
          font-size: 0.9em;
          color: var(--muted-gray);
          margin-bottom: 5px;
        }

        .bd-info-box p {
          margin: 0;
          color: var(--dark-gray);
          line-height: 1.4;
        }

        .bd-items {
          background: var(--accent-soft);
          padding: var(--spacing-md);
          border-radius: 6px;
          margin-bottom: var(--spacing-md);
        }

        .bd-items label {
          display: block;
          font-size: 0.9em;
          color: var(--muted-gray);
          margin-bottom: 8px;
        }

        .bd-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-gray);
          font-size: 0.9em;
        }

        .bd-item:last-child {
          border-bottom: none;
        }

        .bd-item-qty, .bd-item-price {
          font-weight: 600;
          color: var(--dark-gray);
        }

        .bd-item-price {
          color: var(--primary-pink);
        }

        .bd-order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(196, 69, 105, 0.1) 100%);
          border-radius: 6px;
          font-weight: 600;
        }

        /* Modal Styles */
        .bd-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .bd-modal {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          padding: var(--spacing-lg);
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .bd-modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 1.5em;
          cursor: pointer;
          color: var(--muted-gray);
        }

        .bd-modal h3 {
          margin: 0 0 var(--spacing-lg) 0;
          color: var(--primary-pink);
        }

        .bd-modal-section {
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--border-gray);
        }

        .bd-modal-section:last-child {
          border-bottom: none;
        }

        .bd-modal-section h4 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--dark-gray);
        }

        .bd-modal-section p {
          margin: 8px 0;
          color: var(--dark-gray);
        }

        @media (max-width: 768px) {
          .bd-container {
            padding: var(--spacing-md);
          }

          .bd-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .bd-orders-grid {
            grid-template-columns: 1fr;
          }

          .bd-modal {
            width: 95%;
            max-height: 90vh;
          }
        }
      `}</style>
    </div>
  );
}
