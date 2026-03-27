import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext"; // 1. Import the hook

export default function BrowseFlowers() {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); // 2. Grab the function

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const res = await api.get("/flowers");
        setFlowers(res.data);
      } catch (err) {
        console.error("Error fetching flowers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlowers();
  }, []);

  return (
    <div className="browse-page">
      <header className="browse-header">
        <span className="text-uppercase" style={{ color: 'var(--fora-slate)' }}>The Collection</span>
        <h1 style={{ marginTop: '10px' }}>Seasonal Offerings</h1>
      </header>

      <main className="browse-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px" }}>
            <p className="text-uppercase">Sourcing Blooms...</p>
          </div>
        ) : (
          <div className="flower-collection-grid">
            {flowers.map((flower) => (
              <div key={flower.id} className="editorial-card-wrapper">
                {/* Image & Details Link */}
                <Link to={`/flower-details/${flower.id}`} className="editorial-card">
                  <div className="img-wrapper">
                    <img src={flower.image_url || "https://placehold.co/600x800?text=No+Image"} alt={flower.name} />
                  </div>
                  <span className="card-category">{flower.shop_name || "Boutique Exclusive"}</span>
                  <div className="card-meta">
                    <h3 className="card-title">{flower.name}</h3>
                    <span className="card-price">KSh {parseFloat(flower.price).toLocaleString()}</span>
                  </div>
                </Link>

                {/* 3. QUICK ADD BUTTON (Prevents empty bag redirect) */}
                <button 
                  className="btn-add-quick"
                  onClick={() => addToCart(flower)}
                  style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: '12px',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    border: '1px solid #1A1A1A',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  Add to Selection
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}