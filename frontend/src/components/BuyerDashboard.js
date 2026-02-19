// src/pages/BuyerDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function BuyerDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flowersLoading, setFlowersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Set token once
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) api.setAuthToken(token);
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchFeaturedFlowers();
    updateCartCount();
  }, []);

  // ================================
  // FETCH ORDERS
  // ================================
  const fetchOrders = async () => {
    try {
      const res = await api.get("orders/buyer"); // baseURL already has /api
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // FETCH FLOWERS
  // ================================
  const fetchFeaturedFlowers = async () => {
    try {
      const res = await api.get("flowers");
      const safeData = Array.isArray(res.data) ? res.data : [];
      setFlowers(safeData.slice(0, 6));
    } catch (err) {
      console.error("Failed to fetch flowers:", err);
      setFlowers([]);
    } finally {
      setFlowersLoading(false);
    }
  };

  // ================================
  // FETCH SHOP DETAILS
  // ================================
  const fetchShopDetails = async (floristId) => {
    if (!floristId) return;

    try {
      const res = await api.get(`auth/shop/${floristId}`);
      setSelectedShop(res.data || null);
    } catch (err) {
      console.error("Failed to fetch shop:", err);
      setSelectedShop(null);
    }
  };

  // ================================
  // CART
  // ================================
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = Array.isArray(cart)
      ? cart.reduce((acc, item) => acc + (item.quantity || 0), 0)
      : 0;
    setCartCount(count);
  };

  const addToCart = (flower) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex(i => i.id === flower.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: flower.id,
        name: flower.name,
        price: flower.price,
        image_url: flower.image_url,
        shop_name: flower.shop_name,
        quantity: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ================================
  // RENDER
  // ================================
  return (
    <div className="bd-container">
      <div className="bd-header">
        <div>
          <h1>Welcome, {user?.name || "Buyer"}!</h1>
          <p>{user?.email}</p>
        </div>
        <button className="btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Featured Flowers */}
      <div className="bd-featured-section">
        <h2>Featured Flowers</h2>

        {flowersLoading ? (
          <p>Loading flowers...</p>
        ) : flowers.length === 0 ? (
          <p>No flowers available.</p>
        ) : (
          <div className="bd-featured-grid">
            {flowers.map(flower => (
              <div key={flower.id} className="bd-featured-card">
                <img
                  src={flower.image_url || "https://placehold.co/200"}
                  alt={flower.name}
                />
                <h4>{flower.name}</h4>
                <p
                  style={{ cursor: "pointer", color: "#d81b60" }}
                  onClick={() => fetchShopDetails(flower.florist_id)}
                >
                  {flower.shop_name}
                </p>
                <p>KSh {flower.price}</p>
                <button onClick={() => addToCart(flower)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bd-orders-section">
        <h2>My Orders</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bd-order-card">
              <h4>Order #{order.id}</h4>
              <p>Status: {order.status}</p>
              <p>Total: KSh {Number(order.total_price).toFixed(2)}</p>
              <button onClick={() => setSelectedOrder(order)}>
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}