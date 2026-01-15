import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import "../styles/FlowerDetails.css";

export default function FlowerDetails() {
  const { flowerId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [flower, setFlower] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchFlowerDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/flowers/${flowerId}`);
        setFlower(res.data);
      } catch (err) {
        setError("Flower not found");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlowerDetails();
  }, [flowerId]);

  const handleAddToCart = () => {
    if (flower.stock_status === "out_of_stock") {
      setError("This flower is currently out of stock");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(flower);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(value);
  };

  if (loading) {
    return (
      <div className="flower-details-container">
        <div className="loading-state">
          <p>Loading flower details...</p>
        </div>
      </div>
    );
  }

  if (error || !flower) {
    return (
      <div className="flower-details-container">
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-back" onClick={() => navigate("/browse")}>
            ← Back to Flowers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flower-details-container">
      <button className="btn-back" onClick={() => navigate("/browse")}>
        ← Back to Flowers
      </button>

      <div className="details-content">
        {/* Image Section */}
        <div className="details-image-section">
          <div className="main-image">
            <img
              src={flower.image_url || "https://via.placeholder.com/500x400?text=Flower"}
              alt={flower.name}
              onError={(e) => e.target.src = "https://via.placeholder.com/500x400?text=No+Image"}
            />
            {flower.stock_status === "out_of_stock" && (
              <div className="out-of-stock-overlay">Out of Stock</div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="details-info-section">
          {/* Florist Info */}
          <div className="florist-info">
            <h3>🌺 {flower.florist?.shop_name || flower.florist?.name}</h3>
            {flower.florist?.shop_address && (
              <p className="florist-address">📍 {flower.florist.shop_address}</p>
            )}
            {flower.florist?.shop_contact && (
              <p className="florist-contact">📞 {flower.florist.shop_contact}</p>
            )}
          </div>

          {/* Flower Name */}
          <h1 className="flower-name">{flower.name}</h1>

          {/* Stock Status */}
          <div className={`stock-status-badge ${flower.stock_status}`}>
            {flower.stock_status === "in_stock" ? "✓ In Stock" : "✗ Out of Stock"}
          </div>

          {/* Price */}
          <div className="price-section">
            <span className="price">KSh {parseFloat(flower.price).toFixed(2)}</span>
          </div>

          {/* Description */}
          {flower.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{flower.description}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="flower-meta">
            <div className="meta-item">
              <span className="meta-label">Added:</span>
              <span className="meta-value">
                {new Date(flower.created_at).toLocaleDateString("en-KE")}
              </span>
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="add-to-cart-section">
            {flower.stock_status === "in_stock" ? (
              <>
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-input">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="qty-btn"
                    >
                      −
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className={`btn-add-to-cart ${addedToCart ? "added" : ""}`}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
                </button>
              </>
            ) : (
              <div className="out-of-stock-message">
                <p>❌ This flower is currently out of stock</p>
              </div>
            )}
          </div>

          {/* Continue Shopping */}
          <button className="btn-continue-shopping" onClick={() => navigate("/browse")}>
            🌸 Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
