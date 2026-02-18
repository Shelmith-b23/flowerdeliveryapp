import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function BuyerDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flowersLoading, setFlowersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);  // For shop details modal
  const [cartCount, setCartCount] = useState(0);

  // Set auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.setAuthToken(token);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchFeaturedFlowers();
    updateCartCount();
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

  // Fetch shop details for a florist
  const fetchShopDetails = async (floristId) => {
    if (!floristId) {
      console.error("No florist ID provided for shop details.");
      alert("Shop details not available.");
      return;
    }
    console.log("Fetching shop details for florist ID:", floristId);  // Debug log
    try {
      const res = await api.get(`/auth/shop/${floristId}`);
      console.log("Shop details response:", res.data);  // Debug log
      setSelectedShop(res.data);
    } catch (err) {
      console.error("Failed to fetch shop details:", err);
      alert("Unable to load shop details. Please try again.");
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(count);
  };

  const addToCart = (flower) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemIndex = existingCart.findIndex(item => item.id === flower.id);

    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += 1;
    } else {
      existingCart.push({
        id: flower.id,
        name: flower.name,
        price: flower.price,
        image_url: flower.image_url,
        shop_name: flower.shop_name,  // Use shop_name from flower data
        quantity: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    updateCartCount();
    // Simple toast-like feedback could be added here
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
          <h1>Welcome, {user?.name}!</h1>
          <p className="bd-email">{user?.email}</p>
        </div>
        <button className="btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Navigation */}
      <div className="bd-nav">
        <Link to="/browse-flowers" className="btn-secondary">
          Browse Flowers
        </Link>
        <Link to="/checkout" className="btn-primary" style={{ position: "relative" }}>
          Checkout
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>

      {/* Featured Flowers Section */}
      <div className="bd-featured-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Featured Flowers</h2>
          <Link to="/browse-flowers" className="btn-secondary" style={{ textDecoration: "none" }}>
            View All
          </Link>
        </div>

        {flowersLoading ? (
          <p className="bd-loading">Loading featured flowers...</p>
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
                  <p 
                    className="bd-featured-shop" 
                    style={{ cursor: "pointer", textDecoration: "underline", color: "#d81b60" }} 
                    onClick={() => {
                      console.log("Clicked shop for flower:", flower);  // Debug log
                      fetchShopDetails(flower.florist_id);  // Use florist_id directly
                    }}
                  >
                    {flower.shop_name}
                  </p>
                  <div className="bd-featured-footer">
                    <span className="bd-featured-price">KSh {flower.price}</span>
                    <button 
                      className="bd-add-btn"
                      onClick={() => addToCart(flower)}
                    >
                    
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="bd-orders-section">
        <h2> My Orders</h2>
        {loading ? (
          <p className="bd-loading">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="bd-empty">
            <p>You haven't placed any orders yet.</p>
            <Link to="/browse-flowers" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="bd-orders-grid">
            {orders.map(order => (
              <div key={order.id} className="bd-order-card">
                <div className="bd-order-header">
                  <div>
                    <h4>Order #{order.id}</h4>
                    <p className="bd-order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="bd-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)} {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="bd-order-total">
                  <span>Total:</span>
                  <span style={{ color: "var(--primary-pink)" }}>KSh {order.total_price.toFixed(2)}</span>
                </div>
                <button className="btn-secondary" onClick={() => setSelectedOrder(order)} style={{ width: "100%", marginTop: "15px" }}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal for Orders */}
      {selectedOrder && (
        <div className="bd-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="bd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bd-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            <h3>Order #{selectedOrder.id} Details</h3>
            <div className="bd-modal-section">
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
            </div>
            <div className="bd-modal-section">
              <h4>Items</h4>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="bd-item">
                  <span>{item.flower_name} x{item.quantity}</span>
                  <span>KSh {(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setSelectedOrder(null)} style={{ width: "100%" }}>Close</button>
          </div>
        </div>
      )}

      {/* Shop Details Modal */}
      {selectedShop && (
        <div className="bd-modal-overlay" onClick={() => setSelectedShop(null)}>
          <div className="bd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bd-modal-close" onClick={() => setSelectedShop(null)}>✕</button>
            <h3>🏪 Shop Details</h3>
            <div className="bd-modal-section">
              <p><strong>Shop Name:</strong> {selectedShop.shop_name || "Not provided"}</p>
              <p><strong>Address:</strong> {selectedShop.shop_address || "Not provided"}</p>
              <p><strong>Contact:</strong> {selectedShop.shop_contact || "Not provided"}</p>
            </div>
            <button className="btn-primary" onClick={() => setSelectedShop(null)} style={{ width: "100%" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}