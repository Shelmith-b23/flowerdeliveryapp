import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/axios";

// ✅ Context (NAMED import – VERY IMPORTANT)
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

// Dashboards
import BuyerDashboard from "./components/BuyerDashboard";
import FloristDashboard from "./components/FloristDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // -----------------------------
  // Load logged-in user on refresh
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      api.setAuthToken(token);
      setUser(JSON.parse(storedUser));
    }

    setLoadingUser(false);
  }, []);

  if (loadingUser) {
    return <div style={{ padding: "2rem" }}>Loading app...</div>;
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/browse" element={<BrowseFlowers />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/flower-details/:flowerId" element={<FlowerDetails />} />

          {/* Buyer routes */}
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

          <Route
            path="/payment-callback"
            element={<PaymentCallback />}
          />

          {/* Florist routes */}
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
                <FloristFlowerManagement />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

/* ---------------------------------
   Protected Route Component
---------------------------------- */
function ProtectedRoute({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default App;

