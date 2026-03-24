import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register({ setUser }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer", shop_name: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", form);
      api.setAuthToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate(res.data.user.role === "florist" ? "/florist-dashboard" : "/buyer-dashboard");
    } catch (err) { alert("Registration failed"); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <span className="text-uppercase">Registration</span>
        <h2>Join Flora X</h2>
        <form onSubmit={handleRegister} className="modal-form">
          <input type="text" className="fora-input" placeholder="Name" onChange={(e) => setForm({...form, name: e.target.value})} required />
          <input type="email" className="fora-input" placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} required />
          <select className="fora-input" onChange={(e) => setForm({...form, role: e.target.value})}>
            <option value="buyer">Collector (Buyer)</option>
            <option value="florist">Floral Artist (Florist)</option>
          </select>
          {form.role === "florist" && (
            <input type="text" className="fora-input animate-fade-in" placeholder="Shop Name" onChange={(e) => setForm({...form, shop_name: e.target.value})} required />
          )}
          <input type="password" className="fora-input" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} required />
          <button type="submit" className="btn-fora">Register</button>
        </form>
      </div>
    </div>
  );
}