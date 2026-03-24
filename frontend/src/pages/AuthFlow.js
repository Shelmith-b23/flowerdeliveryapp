import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ===============================
   📦 SHARED STYLED WRAPPER
   =============================== */
const AuthLayout = ({ title, subtitle, children }) => (
  <div className="auth-container">
    <div className="auth-card">
      <h2>{title}</h2>
      {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      {children}
    </div>
  </div>
);

/* ===============================
   🔑 1. FORGOT PASSWORD COMPONENT
   =============================== */
export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("If an account exists, a reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a recovery link.">
      {message && <div className="alert alert-success">✅ {message}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {!message && (
        <form onSubmit={handleResetRequest}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
      <div className="auth-footer">
        <Link to="/login">Back to Login</Link>
      </div>
    </AuthLayout>
  );
}

/* ===============================
   🔄 2. RESET PASSWORD COMPONENT (The Landing Page)
   =============================== */
export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Pulls ?token=xyz from URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Token expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Link">
        <div className="alert alert-error">No reset token found. Please request a new link.</div>
        <Link to="/forgot-password">Go to Forgot Password</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="New Password" subtitle="Please enter your new secure password.">
      {message && <div className="alert alert-success">✅ {message}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {!message && (
        <form onSubmit={handlePasswordUpdate}>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="auth-input"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}