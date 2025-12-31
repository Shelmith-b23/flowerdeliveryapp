import { useNavigate } from "react-router-dom";

export default function TopNav({ user, logout }) {
  const navigate = useNavigate();

  return (
    <nav style={{ display: "flex", gap: 16, padding: 16, borderBottom: "1px solid #eee" }}>
      <button onClick={() => navigate("/")}>Home</button>

      {user?.role === "buyer" && (
        <>
          <button onClick={() => navigate("/categories")}>Flowers</button>
          <button onClick={() => navigate("/cart")}>Cart</button>
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

      {user && <button onClick={() => navigate("/security")}>Security</button>}
      <button onClick={logout}>Logout</button>
    </nav>
  );
}
