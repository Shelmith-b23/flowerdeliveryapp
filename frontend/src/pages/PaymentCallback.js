import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");

  const verifyPayment = useCallback(async () => {
    try {
      const reference = localStorage.getItem("pesapal_reference");
      const orderId = localStorage.getItem("order_id");

      if (!reference || !orderId) {
        setStatus("error");
        setLoading(false);
        return;
      }

      const res = await api.post("/payment/pesapal/verify", {
        order_id: parseInt(orderId),
        reference_id: reference,
      });

      if (res.data.success && res.data.status === "completed") {
        setStatus("success");
        setTimeout(() => navigate("/orders"), 3000);
      } else if (res.data.status === "pending") {
        setStatus("pending");
        setTimeout(() => navigate("/orders"), 3000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9f7f4",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        maxWidth: "400px"
      }}>
        {loading ? (
          <>
            <div style={{ fontSize: "3em", marginBottom: "20px" }}>⏳</div>
            <h2>Processing Payment</h2>
            <p>Please wait while we verify your payment...</p>
          </>
        ) : status === "success" ? (
          <>
            <div style={{ fontSize: "3em" }}>✅</div>
            <h2 style={{ color: "#4CAF50" }}>Payment Successful!</h2>
            <p>Redirecting to your orders...</p>
          </>
        ) : status === "pending" ? (
          <>
            <div style={{ fontSize: "3em" }}>⏳</div>
            <h2 style={{ color: "#FFC107" }}>Payment Pending</h2>
            <p>Redirecting to your orders...</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "3em" }}>❌</div>
            <h2 style={{ color: "#d32f2f" }}>Payment Failed</h2>
            <button onClick={() => navigate("/checkout")}>
              ← Back to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
