import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BuyerDashboard from "./components/BuyerDashboard";
import FloristDashboard from "./components/FloristDashboard";
import Home from "./pages/Home";

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const toggleRegister = () => setShowRegister(prev => !prev);

  if (!user) {
    return showRegister ? <Register setUser={setUser} toggleRegister={toggleRegister} /> : <Login setUser={setUser} toggleRegister={toggleRegister} />;
  }

  if (user.role === "buyer") return <BuyerDashboard user={user} />;
  if (user.role === "florist") return <FloristDashboard user={user} />;
  return <Home />;
}
