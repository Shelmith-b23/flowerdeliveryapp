import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      api.setAuthToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      navigate(user.role === "florist" ? "/florist-dashboard" : "/buyer-dashboard");
    } catch (err) { setError(err.response?.data?.error || "Invalid credentials"); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <span className="text-uppercase">Member Access</span>
        <h2>Sign In</h2>
        {error && <div className="auth-error-box">{error}</div>}
        <form onSubmit={handleLogin} className="modal-form">
          <div className="input-group">
            <label className="text-uppercase">Email</label>
            <input type="email" className="fora-input" onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="text-uppercase">Password</label>
            <input type="password" className="fora-input" onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-fora">Access Collection</button>
        </form>
        <p className="auth-subtitle">New? <Link to="/register">Create Account</Link></p>
      </div>
    </div>
  );
}