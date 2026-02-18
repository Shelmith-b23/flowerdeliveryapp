// src/pages/FloristFlowerManagement.js
import { useState, useEffect } from "react";
import api from "../api/axios";
import "../styles/FloristFlowerManagement.css";

export default function FloristFlowerManagement({ user }) {  // Pass user prop from parent
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image_file: null,
    stock_status: "in_stock",
    // New: Shop details
    shop_name: "",
    shop_address: "",
    shop_contact: ""
  });
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.setAuthToken(token);
    }
  }, []);

  // Fetch florist's flowers and pre-fill shop details on mount
  useEffect(() => {
    fetchFlowers();
    // Pre-fill shop details from user prop
    if (user) {
      setFormData(prev => ({
        ...prev,
        shop_name: user.shop_name || "",
        shop_address: user.shop_address || "",
        shop_contact: user.shop_contact || ""
      }));
    }
  }, [user]);

  const fetchFlowers = async () => {
    setLoading(true);
    try {
      // Updated URL: Added "/api" prefix to match backend route (/api/flowers/florist/my-flowers)
      const res = await api.get("api/flowers/florist/my-flowers");
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
      image_file: null,
      stock_status: "in_stock",
      shop_name: user?.shop_name || "",
      shop_address: user?.shop_address || "",
      shop_contact: user?.shop_contact || ""
    });
    setImagePreview("");
    setShowForm(true);
    setError("");
  };

  const handleEditClick = (flower) => {
    setEditingId(flower.id);
    setFormData({
      name: flower.name,
      price: flower.price,
      description: flower.description,
      image_file: null,
      stock_status: flower.stock_status,
      shop_name: user?.shop_name || "",
      shop_address: user?.shop_address || "",
      shop_contact: user?.shop_contact || ""
    });
    // Show the existing image as preview
    setImagePreview(flower.image_url);
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
      image_file: null,
      stock_status: "in_stock",
      shop_name: user?.shop_name || "",
      shop_address: user?.shop_address || "",
      shop_contact: user?.shop_contact || ""
    });
    setImagePreview("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image_file: file
      }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.price) {
      setError("Name and price are required");
      return;
    }

    if (!formData.image_file && !imagePreview) {
      setError("Image is required");
      return;
    }

    // Debug: Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("price", formData.price);
      submitData.append("description", formData.description);
      submitData.append("stock_status", formData.stock_status);
      // New: Append shop details
      submitData.append("shop_name", formData.shop_name);
      submitData.append("shop_address", formData.shop_address);
      submitData.append("shop_contact", formData.shop_contact);
      
      // Only append image_file if a new file was selected
      if (formData.image_file) {
        submitData.append("image_file", formData.image_file);
      }

      if (editingId) {
        // Updated URL: Added "/api" prefix to match backend route (/api/flowers/{editingId})
        await api.put(`api/flowers/${editingId}`, submitData);
        setSuccess("Flower and shop updated successfully");
      } else {
        // Updated URL: Added "/api" prefix to match backend route (/api/flowers)
        await api.post("api/flowers", submitData);
        setSuccess("Flower added and shop updated successfully");
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
        // Updated URL: Added "/api" prefix to match backend route (/api/flowers/{flowerId})
        await api.delete(`api/flowers/${flowerId}`);
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
      // Updated URL: Added "/api" prefix to match backend route (/api/flowers/{flowerId})
      await api.put(`api/flowers/${flowerId}`, {
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
              {/* New: Shop Details Section */}
              <div className="shop-details-section">
                <h3>🏪 Shop Details</h3>
                <div className="form-group">
                  <label>Shop Name</label>
                  <input
                    type="text"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleInputChange}
                    placeholder="Your shop name"
                  />
                </div>
                <div className="form-group">
                  <label>Shop Address</label>
                  <input
                    type="text"
                    name="shop_address"
                    value={formData.shop_address}
                    onChange={handleInputChange}
                    placeholder="Shop address"
                  />
                </div>
                <div className="form-group">
                  <label>Shop Contact</label>
                  <input
                    type="tel"
                    name="shop_contact"
                    value={formData.shop_contact}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

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
                <label>Flower Image *</label>
                <input
                  type="file"
                  name="image_file"
                  onChange={handleImageChange}
                  accept="image/*"
                  required={!imagePreview}
                />
                <p className="file-input-hint">Choose from gallery (PNG, JPG, JPEG, GIF)</p>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <p className="preview-label">Image Preview:</p>
                  <img src={imagePreview} alt="Preview" onError={(e) => e.target.src = "https://placehold.co/100?text=Error"} />
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
                          onError={(e) => e.target.src = "https://placehold.co/150?text=No+Image"}
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