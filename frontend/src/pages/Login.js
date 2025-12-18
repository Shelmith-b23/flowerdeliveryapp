import { useState } from "react";
import api from "../api/axios";
import './Auth.css';

export default function Login({ setUser, toggleRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data);
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-input-group">
          <input className="auth-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="auth-input-group">
          <input className="auth-input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="auth-button" onClick={handleLogin}>Login</button>

        <p className="auth-toggle">Don't have an account? <span className="auth-link" onClick={toggleRegister}>Register</span></p>
      </div>
    </div>
  );
}
