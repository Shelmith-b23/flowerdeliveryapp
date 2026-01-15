import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // 1. Import the cart hook

export default function TopNav({ user, logout }) {
  const navigate = useNavigate();
  const { cartCount } = useCart(); // 2. Pull the cart count from context

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <button onClick={() => navigate("/")}>Home</button>

        {/* Buyer Links */}
        {user?.role === "buyer" && (
          <>
            <button onClick={() => navigate("/categories")}>Flowers</button>
            <button onClick={() => navigate("/cart")} className="cart-btn">
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button onClick={() => navigate("/checkout")}>Checkout</button>
            <button onClick={() => navigate("/orders")}>Orders</button>
          </>
        )}

        {/* Florist Links */}
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
        {user ? (
          <button className="logout-btn" onClick={logout}>
            Logout ({user.name || "User"})
          </button>
        ) : (
          <button onClick={() => navigate("/login")}>Login</button>
        )}
      </div>
    </nav>
  );
}