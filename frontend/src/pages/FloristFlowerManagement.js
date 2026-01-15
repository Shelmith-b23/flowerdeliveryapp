import { useState, useEffect } from "react";
import api from "../api/axios";
import "../styles/FloristFlowerManagement.css";

export default function FloristFlowerManagement() {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    stock_status: "in_stock"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch florist's flowers on mount
  useEffect(() => {
    fetchFlowers();
  }, []);

  const fetchFlowers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/flowers/florist/my-flowers");
      setFlowers(res.data);
    } catch (err) {
      setError("Failed to load flowers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      image_url: "",
      stock_status: "in_stock"
    });
    setShowForm(true);
    setError("");
  };

  const handleEditClick = (flower) => {
    setEditingId(flower.id);
    setFormData({
      name: flower.name,
      price: flower.price,
      description: flower.description,
      image_url: flower.image_url,
      stock_status: flower.stock_status
    });
    setShowForm(true);
    setError("");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      image_url: "",
      stock_status: "in_stock"
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.price) {
      setError("Name and price are required");
      return;
    }

    try {
      if (editingId) {
        // Update existing flower
        await api.put(`/flowers/${editingId}`, formData);
        setSuccess("Flower updated successfully");
      } else {
        // Add new flower
        await api.post("/flowers", formData);
        setSuccess("Flower added successfully");
      }
      
      // Refresh flowers list
      fetchFlowers();
      handleCancel();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save flower");
      console.error(err);
    }
  };

  const handleDelete = async (flowerId) => {
    if (window.confirm("Are you sure you want to delete this flower?")) {
      try {
        await api.delete(`/flowers/${flowerId}`);
        setSuccess("Flower deleted successfully");
        fetchFlowers();
      } catch (err) {
        setError("Failed to delete flower");
        console.error(err);
      }
    }
  };

  const toggleStockStatus = async (flowerId, currentStatus) => {
    const newStatus = currentStatus === "in_stock" ? "out_of_stock" : "in_stock";
    try {
      await api.put(`/flowers/${flowerId}`, {
        stock_status: newStatus
      });
      setSuccess(`Stock status updated to ${newStatus.replace("_", " ")}`);
      fetchFlowers();
    } catch (err) {
      setError("Failed to update stock status");
      console.error(err);
    }
  };

  return (
    <div className="florist-management-container">
      <div className="management-header">
        <h1>🌸 Manage Your Flowers</h1>
        <p>Add, edit, or remove flowers from your inventory</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="management-content">
        {/* Add Flower Button */}
        {!showForm && (
          <button className="btn-add-flower" onClick={handleAddClick}>
            ➕ Add New Flower
          </button>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="flower-form-container">
            <h2>{editingId ? "Edit Flower" : "Add New Flower"}</h2>
            <form onSubmit={handleSubmit} className="flower-form">
              <div className="form-group">
                <label>Flower Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Red Roses"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (KSh) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Status</label>
                  <select
                    name="stock_status"
                    value={formData.stock_status}
                    onChange={handleInputChange}
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your flower (optional)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/flower.jpg"
                />
              </div>

              {formData.image_url && (
                <div className="image-preview">
                  <img src={formData.image_url} alt="Preview" onError={(e) => e.target.src = "https://via.placeholder.com/100?text=Error"} />
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? "Update Flower" : "Add Flower"}
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Flowers List */}
        {!showForm && (
          <div className="flowers-list-section">
            {loading ? (
              <p className="loading-text">Loading your flowers...</p>
            ) : flowers.length === 0 ? (
              <div className="empty-state">
                <p>No flowers yet. Start by adding your first flower!</p>
              </div>
            ) : (
              <div className="flowers-grid">
                {flowers.map(flower => (
                  <div key={flower.id} className="flower-card">
                    <div className="flower-image-container">
                      {flower.image_url && (
                        <img
                          src={flower.image_url}
                          alt={flower.name}
                          className="flower-image"
                          onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Image"}
                        />
                      )}
                      <div className={`stock-badge ${flower.stock_status}`}>
                        {flower.stock_status === "in_stock" ? "✓ In Stock" : "✗ Out of Stock"}
                      </div>
                    </div>

                    <div className="flower-details">
                      <h3>{flower.name}</h3>
                      <p className="flower-price">KSh {parseFloat(flower.price).toFixed(2)}</p>
                      {flower.description && (
                        <p className="flower-description">{flower.description}</p>
                      )}
                    </div>

                    <div className="flower-actions">
                      <button
                        className={`btn-status ${flower.stock_status}`}
                        onClick={() => toggleStockStatus(flower.id, flower.stock_status)}
                        title={`Mark as ${flower.stock_status === "in_stock" ? "out" : "in"} of stock`}
                      >
                        {flower.stock_status === "in_stock" ? "📦 In Stock" : "📭 Out of Stock"}
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(flower)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(flower.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
