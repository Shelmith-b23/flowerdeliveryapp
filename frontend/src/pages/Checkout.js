import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Checkout({ user }) {
  const navigate = useNavigate();

  /* ===============================
     🔐 ATTACH JWT TOKEN (CRITICAL)
     =============================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.setAuthToken(token);
    }
  }, []);

  // Cart + delivery state
  const [cartItems, setCartItems] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({
    buyer_name: user?.name || "",
    buyer_phone: "",
    delivery_address: ""
  });

  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  // Load cart + PesaPal
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

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
  };

  const removeFromCart = (itemId) => {
    const updated = cartItems.filter(i => i.id !== itemId);
    setCartItems(updated);
    try {
      localStorage.setItem("cart", JSON.stringify(updated));
    } catch (e) {}
  };

  const validateForm = () => {
    if (!deliveryInfo.buyer_name.trim()) return alert("Enter full name");
    if (!deliveryInfo.buyer_phone.trim()) return alert("Enter phone number");
    if (!deliveryInfo.delivery_address.trim()) return alert("Enter address");
    return true;
  };

  /* ===============================
     📦 CREATE ORDER
     =============================== */
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
        items
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

  /* ===============================
     💳 PESAPAL PAYMENT
     =============================== */
  const handleInitiatePesaPalPayment = async () => {
    if (!orderCreated) return;

    setPaymentInProgress(true);
    try {
      const res = await api.post("/payment/pesapal/initialize", {
        order_id: orderCreated.order_id
      });

      if (res.data.iframe_url) {
        window.open(
          res.data.iframe_url,
          "PesaPal",
          "width=800,height=600,scrollbars=yes"
        );
        pollPaymentStatus(orderCreated.order_id);
      } else {
        alert("Failed to initialize payment");
      }
    } catch (err) {
      alert("Payment initialization failed");
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
      } catch (_) {}

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();
  };

  /* ===============================
     🛒 EMPTY CART
     =============================== */
  if (cartItems.length === 0 && !orderCreated) {
    return (
      <div className="checkout-container">
        <div className="card" style={{ textAlign: "center", padding: 50 }}>
          <h2>🛒 Your Cart is Empty</h2>
          <button className="btn-primary" onClick={() => navigate("/browse-flowers")}>
            Go Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ===============================
     ✅ ORDER CONFIRMATION
     =============================== */
  if (orderCreated) {
    return (
      <div className="checkout-container">
        <div className="order-confirmation card">
          <h2>✅ Order Created</h2>
          <p><strong>Order ID:</strong> #{orderCreated.order_id}</p>
          <p><strong>Total:</strong> KSh {orderCreated.total_price.toFixed(2)}</p>

          <button
            className="btn-primary"
            onClick={handleInitiatePesaPalPayment}
            disabled={paymentInProgress}
          >
            {paymentInProgress
              ? "Processing..."
              : `Pay KSh ${orderCreated.total_price.toFixed(2)}`}
          </button>
        </div>
      </div>
    );
  }

  /* ===============================
     🧾 CHECKOUT FORM
     =============================== */
  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        <div className="card">
          <h2>Delivery Information</h2>

          <input
            type="text"
            placeholder="Full Name"
            value={deliveryInfo.buyer_name}
            onChange={(e) =>
              setDeliveryInfo({ ...deliveryInfo, buyer_name: e.target.value })
            }
          />

          <input
            type="tel"
            placeholder="+254..."
            value={deliveryInfo.buyer_phone}
            onChange={(e) =>
              setDeliveryInfo({ ...deliveryInfo, buyer_phone: e.target.value })
            }
          />

          <textarea
            placeholder="Delivery address"
            value={deliveryInfo.delivery_address}
            onChange={(e) =>
              setDeliveryInfo({ ...deliveryInfo, delivery_address: e.target.value })
            }
          />

          <button className="btn-primary" onClick={handleCreateOrder} disabled={loading}>
            {loading ? "Creating Order..." : "Proceed to Payment"}
          </button>
        </div>

        <div className="card">
          <h3>Order Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-desc">
                {item.name} × {item.quantity} — KSh {(item.price * item.quantity).toFixed(2)}
              </div>
              <div className="cart-item-actions">
                <button
                  className="btn-small btn-delete"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  ✖ Remove
                </button>
              </div>
            </div>
          ))}
          <h4>Total: KSh {total.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  );
}
