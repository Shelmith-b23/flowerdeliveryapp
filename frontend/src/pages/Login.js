// src/pages/Login.js

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // ✅ FIXED: Removed trailing slash
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // Save token globally
      api.setAuthToken(token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      // Redirect by role
      if (user.role === "buyer") {
        navigate("/buyer-dashboard");
      } else if (user.role === "florist") {
        navigate("/florist-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {error && <div className="auth-error">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="auth-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}