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
    if (e) e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Endpoint matches backend route exactly
      const res = await api.post("/auth/login", { email, password });

      const { token, user } = res.data;

      // Update auth state
      api.setAuthToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      // Redirect logic
      if (user.role === "buyer") {
        navigate("/buyer-dashboard");
      } else if (user.role === "florist") {
        navigate("/florist-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      // Catch 405 or other server errors
      const message = err.response?.data?.error || err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <div className="auth-error" style={{color: 'red'}}>{error}</div>}
        
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}