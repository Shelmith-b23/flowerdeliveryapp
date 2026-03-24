// src/pages/Checkout.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Checkout({ user }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({
    buyer_name: user?.name || "",
    buyer_phone: "",
    delivery_address: ""
  });
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(savedCart);
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);

  const handleCreateOrder = async () => {
    if (!deliveryInfo.buyer_name || !deliveryInfo.buyer_phone || !deliveryInfo.delivery_address) {
      return alert("Please complete all delivery fields.");
    }
    setLoading(true);
    try {
      const items = cartItems.map(item => ({ flower_id: item.id, quantity: item.quantity }));
      const res = await api.post("/orders/create", { ...deliveryInfo, items });
      setOrderCreated(res.data);
      localStorage.removeItem("cart");
    } catch (err) {
      alert(err.response?.data?.error || "Order failed");
    } finally { setLoading(false); }
  };

  if (cartItems.length === 0 && !orderCreated) {
    return (
      <div className="checkout-empty">
        <h2 className="nav-logo">flora x.</h2>
        <h1>Your bag is empty.</h1>
        <Link to="/browse" className="btn-fora btn-outline">Return to Collection</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <nav className="top-nav">
        <Link to="/" className="nav-logo">flora x.</Link>
        <span className="text-uppercase" style={{ fontSize: '0.6rem' }}>Secure Checkout</span>
      </nav>

      <main className="checkout-container-editorial">
        {orderCreated ? (
          /* CONFIRMATION VIEW */
          <div className="order-success-editorial">
            <span className="text-uppercase" style={{ color: 'var(--fora-forest)' }}>Confirmed</span>
            <h1>Thank you for your order.</h1>
            <p>Order #{orderCreated.order_id} has been curated. Our florists are preparing your selection.</p>
            <div className="confirmation-summary">
                <h3>Total Amount: KSh {Number(orderCreated.total_price || orderCreated.total).toLocaleString()}</h3>
                <button className="btn-fora" onClick={() => navigate('/browse')}>Complete Payment</button>
            </div>
          </div>
        ) : (
          /* MAIN CHECKOUT GRID */
          <div className="checkout-grid-editorial">
            {/* Left Column: Form */}
            <section className="checkout-form-section">
              <h2 className="editorial-title">Delivery Details</h2>
              <div className="form-group-editorial">
                <label>Recipient Name</label>
                <input 
                  type="text" 
                  className="fora-input" 
                  value={deliveryInfo.buyer_name}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, buyer_name: e.target.value})}
                />
              </div>
              <div className="form-group-editorial">
                <label>Contact Phone</label>
                <input 
                  type="tel" 
                  className="fora-input" 
                  placeholder="+254..."
                  value={deliveryInfo.buyer_phone}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, buyer_phone: e.target.value})}
                />
              </div>
              <div className="form-group-editorial">
                <label>Delivery Address</label>
                <textarea 
                  className="fora-input" 
                  rows="3"
                  value={deliveryInfo.delivery_address}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, delivery_address: e.target.value})}
                ></textarea>
              </div>
            </section>

            {/* Right Column: Summary */}
            <aside className="checkout-summary-sidebar">
              <div className="summary-sticky">
                <h3 className="text-uppercase">Your Selection</h3>
                <div className="summary-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="summary-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="item-price">KSh {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <span>Grand Total</span>
                  <span className="total-amount">KSh {total.toLocaleString()}</span>
                </div>
                <button className="btn-fora" style={{ width: '100%' }} onClick={handleCreateOrder} disabled={loading}>
                  {loading ? "Processing..." : "Reserve Collection"}
                </button>
                <p className="secure-note">Prices include local taxes and specialized botanical handling.</p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}