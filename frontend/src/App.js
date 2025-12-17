import { useEffect, useState } from "react";
import api from "./api/axios";

import Login from "./pages/Login";
import Register from "./pages/Register";
import BuyerDashboard from "./components/BuyerDashboard";
import FloristDashboard from "./components/FloristDashboard";
import Home from "./pages/Home";

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleRegister = () => setShowRegister((prev) => !prev);

  // 🔐 Restore login on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      api.setAuthToken(token);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // 🚪 Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    api.setAuthToken(null);
    setUser(null);
  };

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return showRegister ? (
      <Register setUser={(u) => {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      }} toggleRegister={toggleRegister} />
    ) : (
      <Login setUser={(u) => {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      }} toggleRegister={toggleRegister} />
    );
  }

  if (user.role === "buyer") {
    return <BuyerDashboard user={user} logout={logout} />;
  }

  if (user.role === "florist") {
    return <FloristDashboard user={user} logout={logout} />;
  }

  return <Home />;
}
