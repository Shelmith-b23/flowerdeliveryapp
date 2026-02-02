import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Checkout({ user }) {
  const navigate = useNavigate();
  
  // State for cart items (synced with Dashboard's localStorage)
  const [cartItems, setCartItems] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({
    buyer_name: user?.name || "",
    buyer_phone: "",
    delivery_address: ""
  });

  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("pesapal");
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  // Load cart and PesaPal scripts on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(savedCart);

    if (!window.pesapal) {
      const script = document.createElement("script");
      script.src = "https://pesapal.com/api/api.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
  };

  const validateForm = () => {
    if (!deliveryInfo.buyer_name.trim()) return alert("Please enter your full name");
    if (!deliveryInfo.buyer_phone.trim()) return alert("Please enter your phone number");
    if (!deliveryInfo.delivery_address.trim()) return alert("Please enter your delivery address");
    return true;
  };

  const handleCreateOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        flower_id: item.id,
        quantity: item.quantity
      }));

      const res = await api.post("/orders/create", {
        buyer_name: deliveryInfo.buyer_name.trim(),
        buyer_phone: deliveryInfo.buyer_phone.trim(),
        delivery_address: deliveryInfo.delivery_address.trim(),
        items: items
      });

      setOrderCreated(res.data);
      clearCart(); // Clear cart after order is successfully in database
    } catch (err) {
      console.error("Order creation error:", err);
      alert(err.response?.data?.error || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePesaPalPayment = async () => {
    if (!orderCreated) return;

    setPaymentInProgress(true);
    try {
      const res = await api.post("/payment/pesapal/initialize", {
        order_id: orderCreated.order_id
      });

      if (res.data.iframe_url) {
        window.open(res.data.iframe_url, "PesaPal", "width=800,height=600,scrollbars=yes");
        pollPaymentStatus(orderCreated.order_id);
      } else {
        alert("Failed to initialize payment.");
      }
    } catch (err) {
      alert("Payment initialization error");
    } finally {
      setPaymentInProgress(false);
    }
  };

  const pollPaymentStatus = async (orderId) => {
    let attempts = 0;
    const maxAttempts = 60; 

    const checkStatus = async () => {
      try {
        const res = await api.get(`/payment/pesapal/check-status/${orderId}`);
        if (res.data.paid) {
          alert("✅ Payment successful!");
          navigate("/dashboard");
          return;
        }
        attempts++;
        if (attempts < maxAttempts) setTimeout(checkStatus, 5000);
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) setTimeout(checkStatus, 5000);
      }
    };
    checkStatus();
  };

  // 1. EMPTY CART VIEW
  if (cartItems.length === 0 && !orderCreated) {
    return (
      <div className="checkout-container">
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <h2>🛒 Your Cart is Empty</h2>
          <button className="btn-primary" onClick={() => navigate("/browse-flowers")}>
            Go Shopping
          </button>
        </div>
      </div>
    );
  }

  // 2. ORDER CONFIRMATION / PAYMENT VIEW
  if (orderCreated) {
    return (
      <div className="checkout-container">
        <div className="order-confirmation card">
          <h2 style={{ color: "var(--success)" }}>✅ Order Created</h2>
          <div className="detail-section">
            <p><strong>Order ID:</strong> #{orderCreated.order_id}</p>
            <p><strong>Total:</strong> KSh {orderCreated.total_price.toFixed(2)}</p>
          </div>
          
          <div className="payment-section">
            <h4>💳 Pay via M-Pesa / Card</h4>
            <p>Complete your payment securely via PesaPal.</p>
            <button 
              className="btn-primary" 
              onClick={handleInitiatePesaPalPayment}
              disabled={paymentInProgress}
              style={{ width: "100%" }}
            >
              {paymentInProgress ? "⏳ Processing..." : `Pay KSh ${orderCreated.total_price.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN CHECKOUT FORM
  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        <div className="card">
          <h2>📦 Delivery Information</h2>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" className="form-input" value={deliveryInfo.buyer_name} onChange={(e) => setDeliveryInfo({ ...deliveryInfo, buyer_name: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="tel" className="form-input" placeholder="+254..." value={deliveryInfo.buyer_phone} onChange={(e) => setDeliveryInfo({ ...deliveryInfo, buyer_phone: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Address</label>
            <textarea className="form-input" value={deliveryInfo.delivery_address} onChange={(e) => setDeliveryInfo({ ...deliveryInfo, delivery_address: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={handleCreateOrder} disabled={loading} style={{ width: "100%", marginTop: "20px" }}>
            {loading ? "Creating Order..." : "Proceed to Payment"}
          </button>
        </div>

        <div className="card order-summary">
          <h3>🌸 Order Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} className="summary-item">
              <span>{item.name} (x{item.quantity})</span>
              <span>KSh {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="total-row">
            <span>Total</span>
            <span>KSh {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-container { max-width: 1100px; margin: 40px auto; padding: 20px; font-family: sans-serif; }
        .checkout-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; }
        .card { background: white; padding: 25px; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .input-group { margin-bottom: 15px; }
        .input-group label { display: block; margin-bottom: 5px; font-weight: 600; color: #555; }
        .form-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
        .summary-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
        .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em; margin-top: 20px; color: #d81b60; }
        .btn-primary { background: #d81b60; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
        .btn-primary:disabled { background: #ccc; }
        .order-confirmation { max-width: 500px; margin: 0 auto; text-align: center; }
        .detail-section { background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .payment-section { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px dashed #d81b60; }
        @media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}