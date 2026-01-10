import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Auth.css";

export default function Register({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      api.setAuthToken(token);
      setUser(user);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-input-group">
          <label>Full Name</label>
          <input
            className="auth-input"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="auth-input-group">
          <label>Email Address</label>
          <input
            className="auth-input"
            type="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-input-group">
          <label>Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="auth-input-group">
          <label>Account Type</label>
          <select
            className="auth-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="buyer">Buyer</option>
            <option value="florist">Florist</option>
          </select>
        </div>

        <button
          className="auth-button"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="auth-toggle">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

