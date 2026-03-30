import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const location = useLocation(); // To grab URL params
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");

  // Helper to get params from the URL
  const queryParams = new URLSearchParams(location.search);
  const trackingId = queryParams.get("OrderTrackingId");
  const merchantRef = queryParams.get("OrderMerchantReference");

  const verifyPayment = useCallback(async () => {
    try {
      const orderId = merchantRef || localStorage.getItem("order_id");

      if (!orderId) {
        setStatus("error");
        setLoading(false);
        return;
      }

      const res = await api.get(`/payment/daraja/check-status/${orderId}`);

      if (res.data.paid) {
        setStatus("success");
        setTimeout(() => navigate("/buyer-dashboard"), 3000);
      } else if (res.data.status === "pending") {
        setStatus("pending");
        setTimeout(() => navigate("/buyer-dashboard"), 3000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, [navigate, merchantRef]);
  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  // Clean, Editorial UI matching your Dashboard
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFF", // Pure white for that gallery feel
      padding: "20px",
      fontFamily: "inherit"
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "450px",
        width: "100%"
      }}>
        {loading ? (
          <div className="fade-in">
             <span className="text-uppercase" style={{ fontSize: '10px', letterSpacing: '3px', color: '#BBB' }}>Authenticating</span>
             <h2 className="empty-title-serif" style={{ fontSize: '2.5rem', margin: '20px 0' }}>Verifying Selection</h2>
             <div className="loading-bar-container" style={{ width: '60px', height: '1px', background: '#EEE', margin: '0 auto' }}>
                <div className="loading-bar-active" style={{ width: '50%', height: '100%', background: '#1A1A1A' }}></div>
             </div>
          </div>
        ) : status === "success" ? (
          <div className="fade-in">
            <span className="text-uppercase" style={{ color: '#4A5D4E', fontSize: '10px', fontWeight: '700', letterSpacing: '2px' }}>Confirmed</span>
            <h2 className="empty-title-serif" style={{ fontSize: '3rem', margin: '15px 0' }}>Payment Received.</h2>
            <p style={{ color: '#717171', marginBottom: '30px' }}>Your botanical collection is now being prepared for transit.</p>
            <button className="btn-fora" onClick={() => navigate("/buyer-dashboard")}>View Dashboard</button>
          </div>
        ) : (
          <div className="fade-in">
            <span className="text-uppercase" style={{ color: '#d32f2f', fontSize: '10px', fontWeight: '700', letterSpacing: '2px' }}>Incomplete</span>
            <h2 className="empty-title-serif" style={{ fontSize: '2.5rem', margin: '15px 0' }}>Transaction Unresolved</h2>
            <p style={{ color: '#717171', marginBottom: '30px' }}>We couldn't verify this payment. Please contact support if funds were deducted.</p>
            <button className="btn-fora btn-outline" style={{ width: '100%' }} onClick={() => navigate("/checkout")}>
              Return to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}