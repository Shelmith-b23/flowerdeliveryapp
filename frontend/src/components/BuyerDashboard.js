// src/components/BuyerDashboard.js
import React from "react";
import { Link } from "react-router-dom";

export default function BuyerDashboard({ user, orders = [] }) {
  return (
    <div className="bd-container-seamless">
      <header className="bd-header-refined">
        <span className="text-uppercase">Member Profile</span>
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="bd-email-small">{user?.email}</p>
      </header>

      <div className="bd-layout-grid">
        {/* Sidebar Nav */}
        <aside className="bd-sidebar">
          <nav className="bd-nav-vertical">
            <Link to="/browse" className="nav-link-item">Explore Collections</Link>
            <Link to="/checkout" className="nav-link-item">View Bag</Link>
            <button className="nav-link-item logout-btn">Sign Out</button>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="bd-main-content">
          <h2 className="section-title-small">Recent Orders</h2>
          <div className="order-list-seamless">
            {orders.length === 0 ? (
              <div className="empty-state-small">
                <p>Your botanical history is currently empty.</p>
                <Link to="/browse" className="action-link">Start a Collection</Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="order-row-hairline">
                  <div className="order-info">
                    <span className="text-uppercase">Order #{order.id}</span>
                    <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-tag ${order.status}`}>{order.status}</span>
                  </div>
                  <span className="order-total">KSh {order.total_price?.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}