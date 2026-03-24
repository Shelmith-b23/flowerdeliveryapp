import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function BuyerDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flowersLoading, setFlowersLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchFeaturedFlowers();
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    setCartCount(count);
  };

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
      setFlowers(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
    } catch (err) {
      console.error("Failed to fetch flowers:", err);
    } finally {
      setFlowersLoading(false);
    }
  };

  const addToCart = (flower) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex(i => i.id === flower.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...flower, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  };

  const handleLogout = () => {
    api.setAuthToken(null);
    navigate("/login");
  };

  return (
    <div className="bd-container">
      <div className="bd-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <div>
          <h1>Welcome, {user?.name || "Buyer"}!</h1>
          <p>{user?.email}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* ✅ CHECKOUT BUTTON */}
          <Link to="/checkout" className="btn-checkout" style={{ backgroundColor: '#8b0d0d', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>
            🛒 Checkout ({cartCount})
          </Link>
          <button className="btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <section className="bd-featured-section">
        <h2>Featured Flowers</h2>
        {flowersLoading ? <p>Loading...</p> : (
          <div className="bd-featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {flowers.map(flower => (
              <div key={flower.id} className="bd-featured-card" style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
                <img src={flower.image_url || "https://placehold.co/200"} alt={flower.name} style={{ width: '100%' }} />
                <h4>{flower.name}</h4>
                <p>KSh {flower.price}</p>
                <button onClick={() => addToCart(flower)} style={{ width: '100%', cursor: 'pointer' }}>Add to Cart</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bd-orders-section" style={{ marginTop: '2rem' }}>
        <h2>My Orders</h2>
        {loading ? <p>Loading...</p> : orders.length === 0 ? <p>No orders yet.</p> : (
          orders.map(order => (
            <div key={order.id} className="bd-order-card" style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <p>Order #{order.id} - <strong>{order.status}</strong></p>
              <p>Total: KSh {Number(order.total_price).toFixed(2)}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}