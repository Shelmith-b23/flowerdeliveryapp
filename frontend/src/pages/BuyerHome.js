import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import './Home.css';

export default function BuyerHome({ user, logout }) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <TopNav user={user} logout={logout} />

      <h1>Welcome, {user?.name} 🌸</h1>

      <button onClick={() => navigate("/categories")}>Browse Flowers</button>
      <button onClick={() => navigate("/cart")}>Cart</button>
      <button onClick={() => navigate("/orders")}>Orders</button>
    </div>
  );
}
