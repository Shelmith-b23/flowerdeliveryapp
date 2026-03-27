// src/pages/FloristFlowerManagement.js
import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function FloristFlowerManagement({ user }) {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState("All");

  // Form State
  const [newFlower, setNewFlower] = useState({
    name: "",
    price: "",
    description: "",
    category: "Seasonal",
    image: null
  });

  useEffect(() => {
    fetchMyFlowers();
  }, []);

  const fetchMyFlowers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/florist/my-flowers");
      setFlowers(res.data || []);
    } catch (err) {
      console.error("Error fetching collection:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newFlower).forEach(key => formData.append(key, newFlower[key]));
    formData.append("florist_id", user.id);

    try {
      await api.post("/flowers", formData);
      setShowAddModal(false);
      fetchMyFlowers();
      setNewFlower({ name: "", price: "", description: "", category: "Seasonal", image: null });
    } catch (err) {
      alert("Error uploading specimen. Please try a smaller image.");
    }
  };

  const categories = ["All", "Roses", "Lilies", "Seasonal", "Bouquets"];
  const filteredFlowers = filter === "All" 
    ? flowers 
    : flowers.filter(f => f.category === filter);

  return (
    <div className="bd-container-seamless">
      <header className="bd-header-refined">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span className="text-uppercase">Inventory Management</span>
            <h1>Curation Gallery</h1>
          </div>
          <button className="btn-fora" onClick={() => setShowAddModal(true)}>+ Add New Bloom</button>
        </div>

        {/* CATEGORY FILTER */}
        <div className="filter-bar" style={{ marginTop: '40px', display: 'flex', gap: '25px', borderBottom: '1px solid #EEE', paddingBottom: '15px' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`filter-link ${filter === cat ? 'active' : ''}`}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', 
                fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
                color: filter === cat ? '#1A1A1A' : '#717171',
                fontWeight: filter === cat ? '700' : '400'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main style={{ marginTop: '40px' }}>
        {loading ? (
          <p className="text-uppercase" style={{ textAlign: 'center', padding: '100px' }}>Opening Vault...</p>
        ) : (
          <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '50px' }}>
            {filteredFlowers.map((flower) => (
              <div key={flower.id} className="flower-card-hairline">
                <div className="flower-img-wrapper" style={{ height: '400px', overflow: 'hidden', background: '#F9F9F9' }}>
                  <img 
                    src={flower.image_url} 
                    alt={flower.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div className="flower-details" style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="text-uppercase" style={{ fontSize: '10px', color: '#717171' }}>{flower.category || 'Seasonal'}</span>
                    <span className="order-total" style={{ fontWeight: '600' }}>KSh {parseFloat(flower.price).toLocaleString()}</span>
                  </div>
                  <h3 className="empty-title-serif" style={{ fontSize: '1.6rem', margin: '10px 0' }}>{flower.name}</h3>
                  <div className="table-actions" style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                    <button className="action-link">Edit Detail</button>
                    <button className="action-link delete">Archive</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD BLOOM MODAL */}
      {showAddModal && (
        <div className="fd-modal-overlay">
          <div className="fd-modal" style={{ maxWidth: '500px' }}>
            <span className="text-uppercase">New Accession</span>
            <h2 className="empty-title-serif">Register Specimen</h2>
            <form onSubmit={handleUpload} className="modal-form" style={{ marginTop: '30px' }}>
              <div className="input-group">
                <label className="text-uppercase">Scientific or Common Name</label>
                <input type="text" className="fora-input" onChange={e => setNewFlower({...newFlower, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="text-uppercase">Price (KSh)</label>
                <input type="number" className="fora-input" onChange={e => setNewFlower({...newFlower, price: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="text-uppercase">Category</label>
                <select className="fora-input" onChange={e => setNewFlower({...newFlower, category: e.target.value})}>
                  {categories.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="text-uppercase">Portrait (Image)</label>
                <input type="file" className="fora-input" onChange={e => setNewFlower({...newFlower, image: e.target.files[0]})} required />
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                <button type="submit" className="btn-fora">Publish Bloom</button>
                <button type="button" className="btn-fora btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}