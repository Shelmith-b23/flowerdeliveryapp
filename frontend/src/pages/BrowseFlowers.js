// src/pages/BrowseFlowers.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function BrowseFlowers() {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      {/* Editorial Header */}
      <header className="browse-header">
        <span className="text-uppercase" style={{ color: 'var(--fora-slate)' }}>The Collection</span>
        <h1 style={{ marginTop: '10px' }}>Seasonal Offerings</h1>
        <p style={{ maxWidth: '500px', margin: '20px auto', color: 'var(--fora-slate)' }}>
          A curated selection of the world’s most exquisite botanical specimens, 
          sourced directly from our network of independent floral artists.
        </p>
      </header>

      <main className="browse-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px" }}>
            <p className="text-uppercase">Sourcing Blooms...</p>
          </div>
        ) : (
          <div className="flower-collection-grid">
            {flowers.map((flower) => (
              <Link 
                to={`/flower-details/${flower.id}`} 
                key={flower.id} 
                className="editorial-card"
              >
                <div className="img-wrapper">
                  <img 
                    src={flower.image_url || "https://placehold.co/600x800?text=No+Image"} 
                    alt={flower.name} 
                  />
                  {flower.stock_status === 'out_of_stock' && (
                    <div className="stock-badge" style={{ background: 'var(--fora-dark)' }}>
                      Archive Only
                    </div>
                  )}
                </div>
                
                <span className="card-category">
                  {flower.shop_name || "Boutique Exclusive"}
                </span>
                
                <div className="card-meta">
                  <h3 className="card-title">{flower.name}</h3>
                  <span className="card-price">KSh {parseFloat(flower.price).toLocaleString()}</span>
                </div>
                
                <p style={{ fontSize: '0.85rem', marginTop: '10px', color: 'var(--fora-slate)' }}>
                  {flower.description?.substring(0, 60)}...
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Subtle Footer spacing */}
      <footer style={{ padding: '100px 0', textAlign: 'center' }}>
        <Link to="/" className="btn-fora btn-outline">Back to Gallery</Link>
      </footer>
    </div>
  );
}