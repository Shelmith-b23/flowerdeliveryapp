import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function Checkout({ user }) {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [deliveryInfo, setDeliveryInfo] = useState({
    buyer_name: user?.name || "",
    buyer_phone: "",
    delivery_address: ""
  });

  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("pesapal");
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    // Load PesaPal script if needed
    if (!window.pesapal) {
      const script = document.createElement("script");
      script.src = "https://pesapal.com/api/api.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const validateForm = () => {
    if (!deliveryInfo.buyer_name.trim()) {
      alert("Please enter your full name");
      return false;
    }
    if (!deliveryInfo.buyer_phone.trim()) {
      alert("Please enter your phone number");
      return false;
    }
    if (!deliveryInfo.delivery_address.trim()) {
      alert("Please enter your delivery address");
      return false;
    }
    return true;
  };

  const handleCreateOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare items data
      const items = cartItems.map(item => ({
        flower_id: item.id,
        quantity: item.quantity
      }));

      // Create order
      const res = await api.post("/orders/create", {
        buyer_name: deliveryInfo.buyer_name.trim(),
        buyer_phone: deliveryInfo.buyer_phone.trim(),
        delivery_address: deliveryInfo.delivery_address.trim(),
        items: items
      });

      setOrderCreated(res.data);
      clearCart();
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
      // Initialize PesaPal payment
      const res = await api.post("/payment/pesapal/initialize", {
        order_id: orderCreated.order_id
      });

      if (res.data.iframe_url) {
        // Open PesaPal payment iframe in a new window/modal
        window.open(
          res.data.iframe_url,
          "PesaPal",
          "width=800,height=600,scrollbars=yes"
        );

        // Store reference for verification
        localStorage.setItem("pesapal_reference", res.data.reference);
        localStorage.setItem("order_id", orderCreated.order_id);

        // Poll for payment status
        pollPaymentStatus(orderCreated.order_id);
      } else {
        alert("Failed to initialize payment. Please try again.");
      }
    } catch (err) {
      console.error("Payment initialization error:", err);
      alert(err.response?.data?.error || "Failed to initialize payment");
    } finally {
      setPaymentInProgress(false);
    }
  };

  const pollPaymentStatus = async (orderId) => {
    // Poll for 5 minutes
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts × 5 seconds = 5 minutes

    const checkStatus = async () => {
      try {
        const res = await api.get(`/payment/pesapal/check-status/${orderId}`);

        if (res.data.paid) {
          alert("✅ Payment successful! Your order is being processed.");
          setTimeout(() => navigate("/orders"), 2000);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        } else {
          alert("Payment verification timed out. Please check your order status.");
        }
      } catch (err) {
        console.error("Status check error:", err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      }
    };

    checkStatus();
  };

  // Order confirmation screen
  if (orderCreated) {
    return (
      <div className="checkout-container">
        <div className="order-confirmation card">
          <h2>✅ Order Confirmation</h2>
          <p style={{ color: "var(--success)", fontSize: "1.1em", fontWeight: "600" }}>
            Order #{orderCreated.order_id} has been created!
          </p>

          <div className="confirmation-details">
            <div className="detail-section">
              <h4>📦 Order Details</h4>
              <p><strong>Order ID:</strong> #{orderCreated.order_id}</p>
              <p><strong>Total Amount:</strong> KSh {orderCreated.total_price.toFixed(2)}</p>
            </div>

            <div className="detail-section">
              <h4>👤 Delivery Information</h4>
              <p><strong>Name:</strong> {deliveryInfo.buyer_name}</p>
              <p><strong>Phone:</strong> {deliveryInfo.buyer_phone}</p>
              <p><strong>Address:</strong> {deliveryInfo.delivery_address}</p>
            </div>

            <div className="detail-section">
              <h4>🌸 Items</h4>
              {cartItems.map(item => (
                <p key={item.id}>
                  {item.name} × {item.quantity} = KSh {(item.price * item.quantity).toFixed(2)}
                </p>
              ))}
            </div>
          </div>

          <div className="payment-section">
            <h4>💳 Payment Method</h4>
            
            {/* Payment Method Selection */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", marginBottom: "10px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="payment-method"
                  value="pesapal"
                  checked={paymentMethod === "pesapal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: "10px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "1em" }}>
                  🏦 PesaPal (Mobile Money & Cards)
                </span>
              </label>
              <p style={{ marginLeft: "25px", fontSize: "0.9em", color: "#666" }}>
                Secure payment via M-Pesa, Airtel Money, or Visa/Mastercard
              </p>
            </div>

            <div style={{ 
              backgroundColor: "var(--accent-soft)", 
              padding: "15px", 
              borderRadius: "8px", 
              marginBottom: "20px",
              borderLeft: "4px solid var(--primary-pink)"
            }}>
              <p style={{ margin: "0", color: "#666", fontSize: "0.95em" }}>
                <strong>Amount to Pay:</strong> KSh {orderCreated.total_price.toFixed(2)}
              </p>
            </div>

            <p style={{ marginBottom: "20px", color: "#666", fontSize: "0.9em" }}>
              You will be redirected to {paymentMethod === "pesapal" ? "PesaPal" : "payment gateway"} to complete your payment securely.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setOrderCreated(null);
                  setDeliveryInfo({ buyer_name: user?.name || "", buyer_phone: "", delivery_address: "" });
                }}
                disabled={paymentInProgress}
              >
                ← Edit Order
              </button>
              {paymentMethod === "pesapal" && (
                <button 
                  className="btn-primary" 
                  onClick={handleInitiatePesaPalPayment}
                  disabled={paymentInProgress || loading}
                  style={{ flex: 1, minWidth: "200px" }}
                >
                  {paymentInProgress ? "⏳ Processing..." : "💳 Pay with PesaPal"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );

  }

  // Checkout form
  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="card">
          <h2>🛒 Checkout</h2>
          <p style={{ color: "var(--muted-gray)", marginBottom: "20px" }}>
            Your cart is empty
          </p>
          <button 
            className="btn-primary"
            onClick={() => navigate("/browse-flowers")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "30px" }}>
        {/* Delivery Form */}
        <div className="card">
          <h2>📦 Delivery Information</h2>

          <div className="auth-input-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Your full name"
              value={deliveryInfo.buyer_name}
              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, buyer_name: e.target.value })}
            />
          </div>

          <div className="auth-input-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              className="auth-input"
              placeholder="Your phone number (e.g., +254712345678)"
              value={deliveryInfo.buyer_phone}
              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, buyer_phone: e.target.value })}
            />
          </div>

          <div className="auth-input-group">
            <label>Delivery Address *</label>
            <textarea
              className="auth-input"
              placeholder="Street address, building, apartment, etc."
              value={deliveryInfo.delivery_address}
              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, delivery_address: e.target.value })}
              style={{ minHeight: "100px", resize: "vertical" }}
            />
          </div>

          <button 
            className="auth-button"
            onClick={handleCreateOrder}
            disabled={loading}
            style={{ width: "100%", marginTop: "20px" }}
          >
            {loading ? "Creating Order..." : "Proceed to Payment"}
          </button>
        </div>

        {/* Order Summary */}
        <div className="order-summary card">
          <h3>🌸 Order Summary</h3>
          <hr />

          <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid var(--border-gray)" }}>
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }}
                  />
                )}
                <p style={{ margin: "5px 0", fontWeight: "600" }}>{item.name}</p>
                <p style={{ margin: "0", fontSize: "0.9em", color: "var(--muted-gray)" }}>
                  {item.florist?.name || "Florist"}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <span>Qty: {item.quantity}</span>
                  <span style={{ fontWeight: "600", color: "var(--primary-pink)" }}>
                    KSh {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "2px solid var(--primary-pink)", paddingTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Subtotal:</span>
              <span>KSh {total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Delivery:</span>
              <span>Free</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2em", fontWeight: "700", color: "var(--primary-pink)" }}>
              <span>Total:</span>
              <span>KSh {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-container {
          max-width: 1200px;
          margin: var(--spacing-xl) auto;
          padding: var(--spacing-lg);
        }

        .order-confirmation {
          max-width: 600px;
          margin: 0 auto;
        }

        .confirmation-details {
          display: grid;
          gap: 20px;
          margin: 30px 0;
        }

        .detail-section {
          background: var(--accent-soft);
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid var(--primary-pink);
        }

        .detail-section h4 {
          margin: 0 0 10px 0;
          color: var(--primary-pink);
        }

        .detail-section p {
          margin: 5px 0;
          color: var(--dark-gray);
        }

        .payment-section {
          background: linear-gradient(135deg, var(--accent-light) 0%, var(--accent-soft) 100%);
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .payment-section h4 {
          color: var(--primary-pink);
          margin-top: 0;
        }

        .order-summary {
          position: sticky;
          top: 20px;
        }

        @media (max-width: 768px) {
          .checkout-container {
            padding: var(--spacing-md);
          }

          .checkout-container > div {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .order-summary {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
