import { useState } from "react";
import api from "../api/axios";
import './Auth.css';  

export default function Register({ setUser, toggleRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  // Florist-specific fields
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (
      !name ||
      !email ||
      !password ||
      (role === "florist" && (!shopName || !location || !contactInfo))
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const payload = { name, email, password, role };
      if (role === "florist") {
        payload.shop_name = shopName;
        payload.location = location;
        payload.contact_info = contactInfo;
      }

      // Register
      await api.post("/auth/register", payload);

      // Auto-login
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      api.setAuthToken(token);
      setUser(user);
    } catch (err) {
      const message = err.response?.data?.error || "Cannot reach server. Check backend or CORS.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join our flower delivery community</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-input-group">
          <label>Full Name</label>
          <input
            className="auth-input"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="auth-input-group">
          <label>Email Address</label>
          <input
            className="auth-input"
            type="email"
            placeholder="john@example.com"
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
          <label>I am a:</label>
          <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="buyer">Buyer (I want to send flowers)</option>
            <option value="florist">Florist (I want to sell flowers)</option>
          </select>
        </div>

        {role === "florist" && (
          <>
            <div className="auth-input-group">
              <label>Shop Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="My Flower Shop"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div className="auth-input-group">
              <label>Location</label>
              <input
                className="auth-input"
                type="text"
                placeholder="City, Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="auth-input-group">
              <label>Contact Info</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Phone or WhatsApp"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
          </>
        )}

        <button className="auth-button" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="auth-toggle">
          Already have an account?{" "}
          <span className="auth-link" onClick={toggleRegister}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
