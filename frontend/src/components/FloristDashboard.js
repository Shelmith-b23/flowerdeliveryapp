import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function FloristDashboard({ user }) {
  const navigate = useNavigate();

  const [shop, setShop] = useState({
    shop_name: user.shop_name || "",
    shop_address: user.shop_address || "",
    shop_contact: user.shop_contact || ""
  });

  const [flower, setFlower] = useState({
    name: "",
    price: "",
    image_url: "",
    description: ""
  });

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingShop, setUpdatingShop] = useState(false); // Added for shop update loading

  // Set auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.setAuthToken(token);
    }
  }, []);

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/florist");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShopUpdate = async () => {
    setUpdatingShop(true);
    try {
      await api.put(`/auth/shop/${user.id}`, shop);
      alert("Shop updated successfully");
    } catch (err) {
      alert("Failed to update shop");
    } finally {
      setUpdatingShop(false);
    }
  };

  const handleAddFlower = async () => {
    try {
      await api.post("/flowers", {
        ...flower,
        florist_id: user.id
      });
      alert("Flower added successfully");

      // Clear form after submit
      setFlower({
        name: "",
        price: "",
        image_url: "",
        description: ""
      });
    } catch (err) {
      alert("Failed to add flower");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      alert("Order status updated");
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="fd-container">
      <div className="fd-header">
        <div>
          <h1>Florist</h1>
          <p className="sub">{user.shop_name || user.name}</p>
        </div>
        <div className="fd-header-actions">
          <button className="fd-nav-btn" onClick={() => navigate("/florist/manage-flowers")}>
            🌸 Manage Flowers
          </button>
          <button className="fd-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="fd-section">
        <h2>📦 Incoming Orders</h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: "var(--muted-gray)" }}>No orders yet</p>
        ) : (
          <div className="fd-orders">
            {orders.map(order => (
              <div key={order.id} className="fd-order">
                <div className="fd-order-header">
                  <div>
                    <h4>Order #{order.id}</h4>
                    <p style={{ fontSize: "0.9em", color: "var(--muted-gray)" }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="fd-order-meta">
                    <span className={`status ${order.paid ? "paid" : "pending"}`}>
                      {order.paid ? "✅ Paid" : "⏳ Pending Payment"}
                    </span>
                    <span className={`status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="fd-buyer-info">
                  <h5>👤 Buyer Information</h5>
                  <div className="info-grid">
                    <div>
                      <label>Full Name:</label>
                      <p>{order.buyer_name}</p>
                    </div>
                    <div>
                      <label>Email:</label>
                      <p>{order.buyer_email}</p>
                    </div>
                    <div>
                      <label>Phone:</label>
                      <p>{order.buyer_phone}</p>
                    </div>
                    <div>
                      <label>Delivery Address:</label>
                      <p>{order.delivery_address}</p>
                    </div>
                  </div>
                </div>

                <div className="fd-items-list">
                  <h5>🌸 Items</h5>
                  {order.items.map(item => (
                    <div key={item.id} className="item-row">
                      <span>{item.flower_name} × {item.quantity}</span>
                      <span className="price">KSh {(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr style={{ margin: "10px 0" }} />
                  <div className="total-row">
                    <strong>Total:</strong>
                    <strong>KSh {order.total_price.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="fd-actions">
                  <button
                    className="fd-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                  {order.status !== "delivered" && (
                    <button
                      className="fd-btn primary"
                      onClick={() => {
                        const nextStatus = 
                          order.status === "pending" ? "processing" :
                          order.status === "processing" ? "delivered" : "pending";
                        handleUpdateOrderStatus(order.id, nextStatus);
                      }}
                    >
                      Mark as {
                        order.status === "pending" ? "Processing" :
                        order.status === "processing" ? "Delivered" : "Pending"
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fd-section">
        <h2>🏪 Shop Details</h2>
        <div className="fd-form-row">
          <input
            type="text"
            placeholder="Shop Name"
            value={shop.shop_name}
            onChange={(e) => setShop({ ...shop, shop_name: e.target.value })}
          />
        </div>
        <div className="fd-form-row">
          <input
            type="text"
            placeholder="Address"
            value={shop.shop_address}
            onChange={(e) => setShop({ ...shop, shop_address: e.target.value })}
          />
        </div>
        <div className="fd-form-row">
          <input
            type="tel"
            placeholder="Contact"
            value={shop.shop_contact}
            onChange={(e) => setShop({ ...shop, shop_contact: e.target.value })}
          />
        </div>
        <button className="fd-btn primary" onClick={handleShopUpdate} disabled={updatingShop}>
          {updatingShop ? "Saving..." : "💾 Save Shop Details"}
        </button>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fd-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Order #{selectedOrder.id} Details</h3>
            
            <div className="fd-form-desc">
              <h5>📋 Buyer Information</h5>
              <p><strong>Name:</strong> {selectedOrder.buyer_name}</p>
              <p><strong>Email:</strong> {selectedOrder.buyer_email}</p>
              <p><strong>Phone:</strong> {selectedOrder.buyer_phone}</p>
              <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
              <p><strong>Payment Status:</strong> {selectedOrder.paid ? "✅ Paid" : "⏳ Pending"}</p>
              <p><strong>Order Status:</strong> {selectedOrder.status.toUpperCase()}</p>
            </div>

            <div className="fd-form-desc">
              <h5>🌸 Items</h5>
              {selectedOrder.items.map(item => (
                <div key={item.id} style={{ marginBottom: "10px" }}>
                  <p>{item.flower_name}</p>
                  <p style={{ fontSize: "0.9em", color: "var(--muted-gray)" }}>
                    Quantity: {item.quantity} × KSh {item.unit_price} = KSh {(item.quantity * item.unit_price).toFixed(2)}
                  </p>
                </div>
              ))}
              <hr />
              <p><strong>Total: KSh {selectedOrder.total_price.toFixed(2)}</strong></p>
            </div>

            <div className="fd-form-actions">
              <button className="btn cancel" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              {selectedOrder.status !== "delivered" && (
                <button 
                  className="btn save"
                  onClick={() => {
                    const nextStatus = 
                      selectedOrder.status === "pending" ? "processing" :
                      selectedOrder.status === "processing" ? "delivered" : "pending";
                    handleUpdateOrderStatus(selectedOrder.id, nextStatus);
                  }}
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fd-order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .fd-order-header h4 {
          margin: 0 0 5px 0;
        }

        .fd-order-meta {
          display: flex;
          gap: 10px;
        }

        .status {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .status.paid {
          background: #d4edda;
          color: #155724;
        }

        .status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .status-processing {
          background: #cce5ff;
          color: #004085;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .status-delivered {
          background: #d4edda;
          color: #155724;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .fd-buyer-info {
          background: var(--accent-soft);
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .fd-buyer-info h5 {
          margin: 0 0 10px 0;
          color: var(--primary-pink);
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-grid div label {
          display: block;
          font-weight: 600;
          color: var(--primary-pink);
          font-size: 0.9em;
          margin-bottom: 3px;
        }

        .info-grid div p {
          margin: 0;
          color: var(--dark-gray);
        }

        .fd-items-list {
          background: var(--accent-light);
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .fd-items-list h5 {
          margin: 0 0 10px 0;
          color: var(--primary-pink);
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-gray);
        }

        .item-row .price {
          font-weight: 600;
          color: var(--primary-pink);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 1.1em;
        }

        @media (max-width: 768px) {
          .fd-order-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}