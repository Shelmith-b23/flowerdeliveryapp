// src/pages/Landing.js
import React from "react";
import { Link } from "react-router-dom";

export default function Landing({ user }) {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="top-nav">
        <Link to="/" className="nav-logo">flora x.</Link>
        <div className="nav-links">
          {user ? (
            <Link to={user.role === 'florist' ? '/florist-dashboard' : '/buyer-dashboard'} className="btn-fora btn-outline">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-fora btn-outline">Sign In</Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <span className="text-uppercase" style={{ color: 'var(--fora-forest)', marginBottom: '1rem', display: 'block' }}>
          Curated Botanical Experiences
        </span>
        <h1>Flowers, Reimagined.</h1>
        <p>
          Discover a world where floral design meets modern editorial elegance. 
          The premier platform for independent florists and discerning collectors.
        </p>
        <div className="hero-actions" style={{ display: 'flex', gap: '16px' }}>
          <Link to="/browse" className="btn-fora">Shop Collection</Link>
          {!user && <Link to="/register" className="btn-fora btn-outline">Join as Florist</Link>}
        </div>
      </header>

      {/* Editorial Grid Section */}
      <section className="editorial-grid">
        <div className="grid-item-large">
          <div className="flower-card">
            <div className="img-container">
              <img src="https://tse1.mm.bing.net/th/id/OIP.wezPWM0gMFPwo5LjNodYjwHaGp?pid=Api&h=220&P=0" alt="Luxe Bouquet" />
            </div>
            <div style={{ padding: '24px' }}>
              <span className="text-uppercase">The Signature Collection</span>
              <h3 style={{ margin: '8px 0' }}>Midnight Peonies</h3>
              <Link to="/browse" style={{ color: 'var(--fora-dark)', fontSize: '0.8rem', fontWeight: '600' }}>View Details →</Link>
            </div>
          </div>
        </div>

        <div className="grid-item-small" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '2.5rem' }}>Boutique service, global reach.</h2>
          <p style={{ margin: '20px 0' }}>
            We partner with the world's most talented florists to bring artistry to your doorstep. 
            Every petal is handled with editorial care.
          </p>
          <Link to="/browse" className="text-uppercase" style={{ textDecoration: 'underline', color: 'var(--fora-dark)' }}>
            Explore Our Vision
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 5%', borderTop: '1px solid var(--fora-border)', textAlign: 'center' }}>
        <h2 className="nav-logo">flora x.</h2>
        <p style={{ marginTop: '10px' }}>© 2026 Flora X Botanical Media. All rights reserved.</p>
      </footer>
    </div>
  );
}