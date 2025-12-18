import { useState } from "react";
import api from "../api/axios";
import './Auth.css';

export default function Register({ setUser, toggleRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    // Prevent page refresh if used inside a <form>
    if (e) e.preventDefault();
    setError("");

    // Basic frontend validation
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Register the user
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      // 2️⃣ Automatically log them in after successful registration
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // 3️⃣ Destructure the token and user from our new Flask response
      const { token, user } = res.data;

      // 4️⃣ Save session
      localStorage.setItem("token", token);
      api.setAuthToken(token);

      // 5️⃣ Update global App state
      setUser(user);

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      
      // Pull the specific error message from Flask (e.g., "Email already exists")
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
          <input className="auth-input" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="auth-input-group">
          <label>Email Address</label>
          <input className="auth-input" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="auth-input-group">
          <label>Password</label>
          <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="auth-input-group">
          <label>I am a:</label>
          <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="buyer">Buyer (I want to send flowers)</option>
            <option value="florist">Florist (I want to sell flowers)</option>
          </select>
        </div>

        <button className="auth-button" onClick={handleRegister} disabled={loading}>{loading ? "Creating Account..." : "Register"}</button>

        <p className="auth-toggle">Already have an account? <span className="auth-link" onClick={toggleRegister}>Login here</span></p>
      </div>
    </div>
  );
}