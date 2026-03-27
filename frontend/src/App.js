// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/axios";

// ✅ Context
import { CartProvider } from "./context/CartContext";

// ✅ Pages (Full screen views)
import Landing from "./pages/Landing";
import BrowseFlowers from "./pages/BrowseFlowers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import FlowerDetails from "./pages/FlowerDetails";
import FloristFlowerManagement from "./pages/FloristFlowerManagement";
import { ForgotPassword, ResetPassword } from "./pages/AuthFlow";

// ✅ Components (Dashboard views)
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
        console.error("Session sync failed:", e);
        localStorage.clear();
      }
    }
    setLoadingUser(false);
  }, []);

  if (loadingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3 style={{ fontFamily: 'serif', letterSpacing: '2px' }}>FLORA X IS LOADING...</h3>
      </div>
    );
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/browse" element={<BrowseFlowers />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/flower-details/:flowerId" element={<FlowerDetails />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />

          {/* ================= BUYER ROUTES ================= */}
          <Route path="/buyer-dashboard" element={
            <ProtectedRoute user={user} role="buyer">
              <BuyerDashboard user={user} />
            </ProtectedRoute>
          } />
          
          {/* FIX: Removed role="buyer" requirement from Checkout. 
              As long as the user is logged in, they can access the bag.
          */}
          <Route path="/checkout" element={
            <ProtectedRoute user={user}>
              <Checkout user={user} />
            </ProtectedRoute>
          } />

          {/* ================= FLORIST ROUTES ================= */}
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

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

/**
 * 🛡️ Smart Protected Route
 * Now includes console logging to help you debug role mismatches.
 */
function ProtectedRoute({ user, role, children }) {
  // 1. If no user session, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If no specific role is required (like our new Checkout fix), let them through
  if (!role) return children;

  const userRole = user.role?.toString().toLowerCase().trim();
  const targetRole = role?.toString().toLowerCase().trim();

  // Log to F12 Console so you can see why a redirect happens
  console.log(`Guard Check: User is [${userRole}], Route needs [${targetRole}]`);

  // 3. Check for specific role mismatch
  if (userRole !== targetRole) {
    console.warn("🚫 Access Denied: Redirecting to Landing.");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;