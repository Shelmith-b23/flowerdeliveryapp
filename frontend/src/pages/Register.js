import { useState } from "react";
import api from "../api/axios";

export default function Register({ setUser, toggleRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", { name, email, password, role });
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data);
    } catch {
      setError("Error registering user");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="buyer">Buyer</option>
        <option value="florist">Florist</option>
      </select>
      <button onClick={handleRegister}>Register</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p onClick={toggleRegister} style={{ cursor: "pointer", color: "blue" }}>Already have an account? Login</p>
    </div>
  );
}
