import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

export default function Checkout({ user }) {
  const { cartItems, subtotal, clearCart } = useCart();
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cartItems.length) {
      setError("Cart is empty. Add some flowers first.");
      return;
    }

    if (!buyerName || !buyerPhone || !deliveryAddress) {
      setError("Complete name, phone and delivery details.");
      return;
    }

    const items = cartItems.map((item) => ({ flower_id: item.id, quantity: item.quantity }));

    setIsSubmitting(true);
    try {
      const orderRes = await api.post("/orders/create", {
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        delivery_address: deliveryAddress,
        items,
      });

      const orderId = orderRes.data.order_id;

      // Use pesapal initialization route
      const paymentRes = await api.post("/payment/pesapal/initialize", { order_id: orderId });
      const reference = paymentRes.data.reference;
      const iframeUrl = paymentRes.data.iframe_url;

      localStorage.setItem("pesapal_reference", reference);
      localStorage.setItem("order_id", orderId);
      clearCart();

      if (iframeUrl) {
        window.location.href = `/payment-callback?OrderMerchantReference=${orderId}&OrderTrackingId=${reference}`;
      } else {
        navigate(`/payment-callback?OrderMerchantReference=${orderId}&OrderTrackingId=${reference}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.error || err.message || "Unable to complete checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container" style={{ minHeight: "70vh", padding: "40px" }}>
      <h1 className="text-uppercase">Checkout</h1>

      {cartItems.length === 0 ? (
        <div>
          <p>Your selection is empty. Browse the collection to add flowers.</p>
          <button className="btn-fora btn-outline" onClick={() => navigate("/browse")}>Browse Flowers</button>
        </div>
      ) : (
        <div className="checkout-grid-editorial">
          <div>
            <h2>Order Summary</h2>
            {cartItems.map(item => (
              <div key={item.id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{item.name}</strong>
                  <span>KSh {item.price * item.quantity}</span>
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>Qty: {item.quantity}</div>
              </div>
            ))}
            <h3 style={{ marginTop: "20px" }}>Total: KSh {subtotal.toLocaleString()}</h3>
          </div>

          <form onSubmit={handleSubmit} className="modal-form" style={{ gap: "15px" }}>
            <h2>Delivery Details</h2>
            {error && <div className="auth-error-box" style={{ marginBottom: "15px" }}>{error}</div>}

            <input
              type="text"
              name="buyerName"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Full Name"
              required
              autoComplete="name"
              className="fora-input"
            />
            <input
              type="tel"
              name="buyerPhone"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="Phone Number"
              required
              autoComplete="tel"
              className="fora-input"
            />
            <textarea
              name="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Delivery Address"
              required
              rows={4}
              className="fora-input"
            />

            <button type="submit" className="btn-fora" disabled={isSubmitting}>
              {isSubmitting ? "Processing Order..." : "Place Order & Pay"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}