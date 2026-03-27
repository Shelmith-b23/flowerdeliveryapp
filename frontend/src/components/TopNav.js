import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "../assets/flora-x.jpg"; // Ensure path is correct

export default function TopNav({ user, logout }) {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <nav className="top-nav">
      {/* LEFT: Brand Logo */}
      <div className="nav-left">
        <Link to="/" className="nav-logo-wrapper">
          <img src={logo} alt="Flora X" className="nav-logo-img" />
        </Link>
      </div>

      {/* CENTER: Role-Based Navigation */}
      <div className="nav-center">
        {user?.role === "buyer" && (
          <>
            <Link to="/categories" className="nav-link-item">Flowers</Link>
            <Link to="/orders" className="nav-link-item">Orders</Link>
          </>
        )}

        {user?.role === "florist" && (
          <>
            <Link to="/florist-dashboard" className="nav-link-item">Dashboard</Link>
            <Link to="/florist/manage-flowers" className="nav-link-item">Inventory</Link>
            <Link to="/orders" className="nav-link-item">Shop Orders</Link>
          </>
        )}
        
        {user && <Link to="/security" className="nav-link-item">Security</Link>}
      </div>

      {/* RIGHT: Actions & User */}
      <div className="nav-right">
        {user?.role === "buyer" && (
          <Link to="/cart" className="nav-cart-link">
            BAG {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        )}

        {user ? (
          <div className="user-profile-nav">
            <span className="user-name-label">{user.name?.split(' ')[0]}</span>
            <button className="logout-btn-minimal" onClick={logout}>Sign Out</button>
          </div>
        ) : (
          <Link to="/login" className="nav-link-item">Sign In</Link>
        )}
      </div>
    </nav>
  );
}