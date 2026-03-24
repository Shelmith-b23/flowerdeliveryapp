// src/components/FloristDashboard.js
import React from "react";
import { Link } from "react-router-dom";

export default function FloristDashboard({ user }) {
  return (
    <div className="bd-container-seamless">
      <header className="bd-header-refined">
        <span className="text-uppercase">Florist Partner</span>
        <h1>{user?.shop_name || "Boutique Studio"}</h1>
      </header>

      <div className="stat-grid-seamless">
        <div className="stat-card-hairline">
          <span className="text-uppercase">Monthly Revenue</span>
          <h3 className="stat-value">KSh 42,000</h3>
        </div>
        <div className="stat-card-hairline">
          <span className="text-uppercase">Active Blooms</span>
          <h3 className="stat-value">12 Specimens</h3>
        </div>
        <div className="stat-card-hairline">
          <span className="text-uppercase">Pending Orders</span>
          <h3 className="stat-value">4</h3>
        </div>
      </div>

      <div className="action-grid-seamless">
        <Link to="/florist/manage-flowers" className="btn-fora">Manage Collection</Link>
        <Link to="/florist/orders" className="btn-fora btn-outline">View Incoming Orders</Link>
      </div>
    </div>
  );
}