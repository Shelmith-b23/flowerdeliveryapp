import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

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
    const fetchFlower = async () => {
      try {
        const res = await api.get(`/flowers/${flowerId}`);
        setFlower(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch flower details.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlower();
  }, [flowerId]);

  const handleAddToCart = () => {
    if (!flower) return;

    if (flower.stock_status === "out_of_stock") {
      setError("This flower is currently out of stock");
      return;
    }

    addToCart(flower, Number(quantity));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) return <p>Loading Flower...</p>;
  if (error) return <p>{error}</p>;
  if (!flower) return <p>Flower not found.</p>;

  return (
    <div className="flower-details-container" style={{ padding: "30px" }}>
      <button className="btn-fora btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
        ← Back
      </button>

      <div className="flower-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <img src={flower.image_url} alt={flower.name} style={{ width: '100%', height: 'auto', borderRadius: '10px' }} />
        </div>
        <div>
          <h1>{flower.name}</h1>
          <p style={{ margin: '10px 0', fontWeight: '700' }}>KSh {Number(flower.price).toLocaleString()}</p>
          <p>{flower.description || "No description provided."}</p>
          <p><strong>Shop:</strong> {flower.shop_name || "Unknown"}</p>
          <p><strong>Status:</strong> {flower.stock_status === 'out_of_stock' ? 'Out of stock' : 'In stock'}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <label>Qty:</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="fora-input" style={{ width: '80px' }} />
          </div>
          <button disabled={flower.stock_status === 'out_of_stock'} className="btn-fora" onClick={handleAddToCart} style={{ marginTop: '20px' }}>
            {addedToCart ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}