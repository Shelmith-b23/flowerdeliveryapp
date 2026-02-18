// src/pages/BuyerDashboard.js (assuming this is the path; adjust if needed)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingFlowers, setLoadingFlowers] = useState(true);
  const [errorOrders, setErrorOrders] = useState("");
  const [errorFlowers, setErrorFlowers] = useState("");
  const navigate = useNavigate();

  // Fetch buyer orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Updated URL: Added "/api" prefix to match backend route (/api/orders/buyer)
        const res = await api.get("api/orders/buyer");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setErrorOrders(err.response?.data?.error || "Failed to fetch orders");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  // Fetch flowers on component mount
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        // Updated URL: Added "/api" prefix to match backend route (/api/flowers)
        const res = await api.get("api/flowers");
        setFlowers(res.data);
      } catch (err) {
        console.error("Failed to fetch flowers:", err);
        setErrorFlowers(err.response?.data?.error || "Failed to fetch flowers");
      } finally {
        setLoadingFlowers(false);
      }
    };

    fetchFlowers();
  }, []);

  // Logout function (assuming you have this; adjust if needed)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    api.setAuthToken(null);
    navigate("/login");
  };

  return (
    <div className="buyer-dashboard">
      <h1>Buyer Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      {/* Orders Section */}
      <h2>Your Orders</h2>
      {loadingOrders ? (
        <p>Loading orders...</p>
      ) : errorOrders ? (
        <p className="error">{errorOrders}</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>{/* Render order details here */}</li>
          ))}
        </ul>
      )}

      {/* Flowers Section */}
      <h2>Available Flowers</h2>
      {loadingFlowers ? (
        <p>Loading flowers...</p>
      ) : errorFlowers ? (
        <p className="error">{errorFlowers}</p>
      ) : (
        <ul>
          {flowers.map((flower) => (
            <li key={flower.id}>{/* Render flower details here */}</li>
          ))}
        </ul>
      )}
    </div>
  );
}