// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      if (token && user) {
        api.setAuthToken(token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);

        // Seamless redirect based on role
        if (user.role === "florist") {
          navigate("/florist-dashboard");
        } else {
          navigate("/buyer-dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <span className="text-uppercase" style={{ textAlign: 'center' }}>Member Access</span>
        <h2 style={{ textAlign: 'center' }}>Sign In</h2>
        
        {error && <div className="auth-error-box">{error}</div>}

        <form onSubmit={handleLogin} className="modal-form">
          <div className="input-group">
            <label className="text-uppercase">Email Address</label>
            <input 
              type="email" 
              className="fora-input" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <label className="text-uppercase" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" size="small" className="forgot-link">
                Forgot?
              </Link>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="fora-input" 
                style={{ paddingRight: '50px' }} // Room for the eye
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-fora" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? "Verifying..." : "Access Collection"}
          </button>
        </form>

        <p className="auth-subtitle" style={{ marginTop: '24px', textAlign: 'center' }}>
          New to Flora X? <Link to="/register" style={{ color: 'var(--fora-dark)', fontWeight: '600' }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
}