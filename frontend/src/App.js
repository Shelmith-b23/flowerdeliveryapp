import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/axios";

// Pages
import BuyerHome from "./pages/BuyerHome";
import FloristHome from "./pages/FloristHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Security from "./pages/Security";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore login on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      api.setAuthToken(token);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    api.setAuthToken(null);
    setUser(null);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/categories" element={<Categories user={user} logout={logout} />} />

        {/* PROTECTED ROUTES */}
        {user && (
          <>
            <Route path="/dashboard" element={<Dashboard user={user} logout={logout} />} />
            <Route path="/security" element={<Security user={user} setUser={setUser} logout={logout} />} />
            <Route path="/cart" element={<Cart user={user} logout={logout} />} />
            <Route path="/orders" element={<Orders user={user} logout={logout} />} />
            <Route path="/profile" element={<Profile user={user} logout={logout} />} />
          </>
        )}

        {/* HOME ROUTE - ROLE BASED */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "buyer" ? (
              <BuyerHome user={user} logout={logout} />
            ) : (
              <FloristHome user={user} logout={logout} />
            )
          }
        />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
