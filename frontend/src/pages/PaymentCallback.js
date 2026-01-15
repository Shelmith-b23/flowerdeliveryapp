import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = localStorage.getItem("pesapal_reference");
      const orderId = localStorage.getItem("order_id");

      if (!reference || !orderId) {
        setStatus("error");
        setLoading(false);
        return;
      }

      // Verify payment with backend
      const res = await api.post("/payment/pesapal/verify", {
        order_id: parseInt(orderId),
        reference_id: reference
      });

      if (res.data.success && res.data.status === "completed") {
        setStatus("success");
        setTimeout(() => {
          navigate("/orders");
        }, 3000);
      } else if (res.data.status === "pending") {
        setStatus("pending");
        setTimeout(() => {
          navigate("/orders");
        }, 3000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

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
            <div style={{
              fontSize: "3em",
              marginBottom: "20px",
              animation: "spin 2s linear infinite"
            }}>
              ⏳
            </div>
            <h2 style={{ color: "#333", marginBottom: "10px" }}>
              Processing Payment
            </h2>
            <p style={{ color: "#666" }}>
              Please wait while we verify your payment...
            </p>
          </>
        ) : status === "success" ? (
          <>
            <div style={{ fontSize: "3em", marginBottom: "20px" }}>
              ✅
            </div>
            <h2 style={{ color: "#4CAF50", marginBottom: "10px" }}>
              Payment Successful!
            </h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Your order has been confirmed and is being processed.
            </p>
            <p style={{ color: "#999", fontSize: "0.9em" }}>
              Redirecting to your orders...
            </p>
          </>
        ) : status === "pending" ? (
          <>
            <div style={{ fontSize: "3em", marginBottom: "20px" }}>
              ⏳
            </div>
            <h2 style={{ color: "#FFC107", marginBottom: "10px" }}>
              Payment Pending
            </h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Your payment is being processed. Please check your order status shortly.
            </p>
            <p style={{ color: "#999", fontSize: "0.9em" }}>
              Redirecting to your orders...
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "3em", marginBottom: "20px" }}>
              ❌
            </div>
            <h2 style={{ color: "#d32f2f", marginBottom: "10px" }}>
              Payment Failed
            </h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              There was an issue processing your payment. Please try again.
            </p>
            <button
              onClick={() => navigate("/checkout")}
              style={{
                backgroundColor: "#d81b60",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1em"
              }}
            >
              ← Back to Checkout
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
