// src/pages/FloristFlowerManagement.js
import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function FloristFlowerManagement({ user }) {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch flowers for this specific florist
  useEffect(() => {
    const fetchMyFlowers = async () => {
      try {
        const res = await api.get("/florist/my-flowers");
        setFlowers(res.data);
      } catch (err) {
        console.error("Error fetching collection:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyFlowers();
  }, []);

  return (
    <div className="management-page">
      <header className="bd-header">
        <div>
          <span className="text-uppercase">Inventory Management</span>
          <h1>Your Collection</h1>
        </div>
        <button className="btn-fora">+ Add New Bloom</button>
      </header>

      <main className="management-container">
        {loading ? (
          <p className="text-uppercase" style={{ textAlign: 'center', padding: '50px' }}>Loading Inventory...</p>
        ) : (
          <div className="table-wrapper-seamless">
            <table className="fora-table">
              <thead>
                <tr>
                  <th className="text-uppercase">Specimen</th>
                  <th className="text-uppercase">Status</th>
                  <th className="text-uppercase">Price</th>
                  <th className="text-uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flowers.map((flower) => (
                  <tr key={flower.id}>
                    <td className="table-item-main">
                      <img src={flower.image_url} alt="" className="table-thumb" />
                      <div className="item-details">
                        <span className="item-name">{flower.name}</span>
                        <span className="item-category">{flower.category || 'Seasonal'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${flower.stock_status}`}>
                        {flower.stock_status === 'in_stock' ? 'Available' : 'Archived'}
                      </span>
                    </td>
                    <td className="item-price">KSh {parseFloat(flower.price).toLocaleString()}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-link">Edit</button>
                        <button className="action-link delete">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}