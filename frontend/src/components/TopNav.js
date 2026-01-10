import { useNavigate } from "react-router-dom";

export default function TopNav({ user, logout }) {
  const navigate = useNavigate();

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <button onClick={() => navigate("/")}>Home</button>

        {user?.role === "buyer" && (
          <>
            <button onClick={() => navigate("/categories")}>Flowers</button>
            <button onClick={() => navigate("/cart")}>Cart</button>
            <button onClick={() => navigate("/checkout")}>Checkout</button>
            <button onClick={() => navigate("/orders")}>Orders</button>
          </>
        )}

        {user?.role === "florist" && (
          <>
            <button onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button onClick={() => navigate("/orders")}>Orders</button>
            <button onClick={() => navigate("/profile")}>Profile</button>
          </>
        )}

        {user && (
          <button onClick={() => navigate("/security")}>Security</button>
        )}
      </div>

      <div className="topnav-right">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
