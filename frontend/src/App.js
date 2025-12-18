import { useEffect, useState } from "react";
import api from "./api/axios";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState(window.location.pathname);

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

  // Keep track of location changes triggered by our navigate helper or browser navigation
  useEffect(() => {
    const onNav = (e) => setPath(window.location.pathname);
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('navigation', onNav);
    window.addEventListener('popstate', onPop);
    return () => { window.removeEventListener('navigation', onNav); window.removeEventListener('popstate', onPop); };
  }, []);

  // 🚪 Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    api.setAuthToken(null);
    setUser(null);
  };

  if (loading) return <p>Loading...</p>;

  // If the path is /categories, render Categories page (available to all users)
  if (path === '/categories') {
    const Categories = require('./pages/Categories').default;
    return <Categories user={user} logout={logout} />;
  }

  if (!user) {
    // If unauthenticated and visiting /dashboard, show login panel instead of dashboard
    if (path === '/dashboard') return (
      showRegister ? (
        <Register setUser={(u) => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); }} toggleRegister={toggleRegister} />
      ) : (
        <Login setUser={(u) => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); }} toggleRegister={toggleRegister} />
      )
    );

    return showRegister ? (
      <Register setUser={(u) => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); }} toggleRegister={toggleRegister} />
    ) : (
      <Login setUser={(u) => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); }} toggleRegister={toggleRegister} />
    );
  }
  // If authenticated and the path is /dashboard, render the Dashboard page. Otherwise show Home.
  if (path === '/dashboard') {
    const Dashboard = require('./pages/Dashboard').default;
    return <Dashboard user={user} logout={logout} />;
  }

  return <Home user={user} setUser={setUser} logout={logout} />;
}
