// src/pages/ForgotAndResetPassword.js
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotAndResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState(null);
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if we are in "Reset" mode via URL token
  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("A restoration link has been dispatched to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to process request.");
    } finally { setLoading(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match.");
    
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password });
      setMessage("Password successfully updated. Redirecting...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Link may have expired.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <span className="text-uppercase" style={{ textAlign: 'center' }}>Account Security</span>
        <h2>{token ? "Reset Password" : "Forgot Password"}</h2>
        
        {message && <div className="auth-success-box">{message}</div>}
        {error && <div className="auth-error-box">{error}</div>}

        {!message || token ? (
          <form onSubmit={token ? handleUpdatePassword : handleRequestReset} className="modal-form">
            {token ? (
              /* RESET VIEW */
              <>
                <div className="input-group">
                  <label className="text-uppercase">New Password</label>
                  <input 
                    type="password" 
                    className="fora-input" 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="text-uppercase">Confirm Password</label>
                  <input 
                    type="password" 
                    className="fora-input" 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </div>
              </>
            ) : (
              /* FORGOT VIEW */
              <div className="input-group">
                <label className="text-uppercase">Registered Email</label>
                <input 
                  type="email" 
                  className="fora-input" 
                  placeholder="name@example.com"
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            )}

            <button type="submit" className="btn-fora" disabled={loading}>
              {loading ? "Processing..." : (token ? "Update Password" : "Send Reset Link")}
            </button>
          </form>
        ) : null}

        <p className="auth-subtitle" style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--fora-dark)', fontWeight: '600' }}>Return to Sign In</Link>
        </p>
      </div>
    </div>
  );
}