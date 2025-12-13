import { useState } from "react";
import api from "../api/axios";

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
    <div>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p onClick={toggleRegister} style={{ cursor: "pointer", color: "blue" }}>Don't have an account? Register</p>
    </div>
  );
}
