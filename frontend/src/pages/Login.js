// src/pages/Login.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Option 1: Toggle State
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
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Server did not return a valid user or token.");
      }

      api.setAuthToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      const userRole = user.role?.toLowerCase();
      if (userRole === "buyer") {
        navigate("/buyer-dashboard");
      } else if (userRole === "florist") {
        navigate("/florist-dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(err.response?.data?.error || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>🌸 Flower Delivery Login</h2>
        
        {error && (
          <div className="auth-error-box" style={{ color: 'red', marginBottom: '1rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}
        
        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="email@example.com"
            className="auth-input"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group" style={{ position: 'relative' }}>
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"} // Option 1: Toggle Input Type
              placeholder="••••••••"
              className="auth-input"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', paddingRight: '40px' }}
            />
            {/* Show/Hide Toggle Button */}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Option 2: Forgot Password Link */}
        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
          <Link 
            to="/forgot-password" 
            style={{ fontSize: '0.85rem', color: '#666', textDecoration: 'none' }}
          >
            Forgot Password?
          </Link>
        </div>

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Sign In"}
        </button>
        
        <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>
            Don’t have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </form>
    </div>
  );
}