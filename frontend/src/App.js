// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/axios";

// Context
import { CartProvider } from "./context/CartContext";

// Pages 
import Landing from "./pages/Landing";
import BrowseFlowers from "./pages/BrowseFlowers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import FlowerDetails from "./pages/FlowerDetails";
import FloristFlowerManagement from "./pages/FloristFlowerManagement";
import { ForgotPassword, ResetPassword } from "./pages/AuthFlow";

// Components
import BuyerDashboard from "./components/BuyerDashboard";
import FloristDashboard from "./components/FloristDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.setAuthToken(token);
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoadingUser(false);
  }, []);

  if (loadingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3>🌸 Loading Flora X...</h3>
      </div>
    );
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/browse" element={<BrowseFlowers />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/flower-details/:flowerId" element={<FlowerDetails />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />

          {/* 🛡️ Buyer Dashboard - Strict Role Check */}
          <Route path="/buyer-dashboard" element={
            <ProtectedRoute user={user} role="buyer">
              <BuyerDashboard user={user} />
            </ProtectedRoute>
          } />
          
          {/* 🛡️ CHECKOUT - Flexible Role Check (Fixes the Bag Link)
              We only check if the user is logged in. 
              This prevents "buyer" vs "Buyer" vs "customer" string mismatches.
          */}
          <Route path="/checkout" element={
            user ? <Checkout user={user} /> : <Navigate to="/login" replace />
          } />

          {/* 🛡️ Florist Routes */}
          <Route path="/florist-dashboard" element={
            <ProtectedRoute user={user} role="florist">
              <FloristDashboard user={user} />
            </ProtectedRoute>
          } />

          <Route path="/florist/manage-flowers" element={
            <ProtectedRoute user={user} role="florist">
              <FloristFlowerManagement user={user} />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

/**
 * Enhanced ProtectedRoute with Logging
 */
function ProtectedRoute({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  
  const userRole = user.role?.toString().toLowerCase().trim();
  const targetRole = role?.toString().toLowerCase().trim();

  // Log to console so you can see why a redirect happens
  if (role && userRole !== targetRole) {
    console.warn(`Access Denied for route ${targetRole}. User is ${userRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;