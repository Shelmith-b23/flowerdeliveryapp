import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function FloristDashboard({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flower, setFlower] = useState({
    name: "",
    price: "",
    image_url: "", // This will now store the Base64 string
    description: ""
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ NEW: Function to convert File to Base64 string
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlower({ ...flower, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("orders/florist");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlower = async (e) => {
    e.preventDefault();
    try {
      await api.post("flowers", {
        ...flower,
        florist_id: user.id
      });
      alert("Flower added successfully!");
      setFlower({ name: "", price: "", image_url: "", description: "" });
      // Reset the file input manually if needed
      e.target.reset();
    } catch (err) {
      alert("Failed to add flower.");
    }
  };

  // ... (handleUpdateStatus and handleLogout remain the same)

  return (
    <div className="fd-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="fd-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <div>
          <h1>Florist</h1>
          <p>Logged in as: <strong>{user?.shop_name || user?.name}</strong></p>
        </div>
        <button onClick={() => {
            api.setAuthToken(null);
            localStorage.removeItem("token");
            navigate("/login");
        }} className="btn-danger">Logout</button>
      </div>

      <div>
        
        <section className="fd-add-flower">
          <h3>Add New Flower</h3>
          <form onSubmit={handleAddFlower} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" placeholder="Flower Name" required
              value={flower.name} onChange={(e) => setFlower({...flower, name: e.target.value})}
            />
            <input 
              type="number" placeholder="Price (KSh)" required
              value={flower.price} onChange={(e) => setFlower({...flower, price: e.target.value})}
            />
            
            {/* ✅ CHANGED: URL input to File input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', color: '#666' }}>Upload Flower Image:</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                required 
              />
            </div>

            {/* ✅ OPTIONAL: Preview the selected image */}
            {flower.image_url && (
              <img 
                src={flower.image_url} 
                alt="Preview" 
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} 
              />
            )}

            <textarea 
              placeholder="Description"
              value={flower.description} onChange={(e) => setFlower({...flower, description: e.target.value})}
            />
            <button type="submit" className="btn-primary">List Flower</button>
          </form>
        </section>

        {/* ... (Orders section remains the same) */}
        <section className="fd-orders">
          <h3> Incoming Orders</h3>
          {/* ... mapping logic from previous response */}
        </section>
      </div>
    </div>
  );
}