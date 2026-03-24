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

// ✅ Dashboards
import BuyerDashboard from "./components/BuyerDashboard";
import FloristDashboard from "./components/FloristDashboard";

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
        // Note: axios.js automatically pulls the token from localStorage for every request
      } catch (e) {
        console.error("Session corrupted. Clearing storage...");
        localStorage.clear();
      }
    }
    setLoadingUser(false);
  }, []);

  if (loadingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3>🌸 Loading Flower App...</h3>
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
          
          {/* New Auth Flow Routes */}
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

          <Route
            path="/checkout"
            element={
              <ProtectedRoute user={user} role="buyer">
                <Checkout user={user} />
              </ProtectedRoute>
            }
          />

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
                {/* User prop passed here to handle shop details and ownership */}
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
 * 🛡️ Protected Route Component
 * Validates existence of user and matches required role to prevent 403/401 errors.
 */
function ProtectedRoute({ user, role, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    console.warn(`Unauthorized Access: User is ${user.role}, but route requires ${role}`);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;