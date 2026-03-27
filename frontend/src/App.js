// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/axios";

// ✅ Context
import { CartProvider } from "./context/CartContext";

// ✅ Components & Pages
import Landing from "./pages/Landing";
import BrowseFlowers from "./pages/BrowseFlowers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import FlowerDetails from "./pages/FlowerDetails";
import FloristFlowerManagement from "./pages/FloristFlowerManagement";

// ✅ Combined Auth Flow (Named Imports)
import { ForgotPassword, ResetPassword } from "./pages/AuthFlow";

// ✅ Dashboards (Ensuring these are the Upgraded Versions)
import BuyerDashboard from "./pages/BuyerDashboard"; 
import FloristDashboard from "./pages/FloristDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ---------------------------------------------------------
  // 🔄 Sync User State with LocalStorage on Refresh
  // ---------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.setAuthToken(token); // Ensure axios header is set on refresh
      } catch (e) {
        console.error("Session corrupted. Clearing storage...");
        localStorage.clear();
      }
    }
    setLoadingUser(false);
  }, []);

  if (loadingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: 'serif' }}>
        <h3 className="animate-pulse">🌸 Preparing your Flora X experience...</h3>
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
          
          {/* Auth Flow */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ================= BUYER ROUTES ================= */}
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute user={user} role="buyer">
                <BuyerDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* CHECKOUT: Explicitly ensuring this is accessible to Buyers */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute user={user} role="buyer">
                <Checkout user={user} />
              </ProtectedRoute>
            }
          />

          {/* PesaPal Callback (Should be public so PesaPal can redirect back) */}
          <Route path="/payment-callback" element={<PaymentCallback />} />

          {/* ================= FLORIST ROUTES ================= */}
          <Route
            path="/florist-dashboard"
            element={
              <ProtectedRoute user={user} role="florist">
                <FloristDashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/florist/manage-flowers"
            element={
              <ProtectedRoute user={user} role="florist">
                <FloristFlowerManagement user={user} />
              </ProtectedRoute>
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

/**
 * 🛡️ Robust Protected Route Component
 */
function ProtectedRoute({ user, role, children }) {
  // 1. If user is still null after loading, they aren't logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Normalize roles to catch "Buyer" vs "buyer" mismatches
  const currentUserRole = user.role?.toString().toLowerCase();
  const targetRole = role?.toString().toLowerCase();

  if (role && currentUserRole !== targetRole) {
    console.warn(`Access Denied: Route needs ${targetRole}, User is ${currentUserRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;