import React, { useState } from 'react';
import './TopNav.css';

export default function TopNav({ user, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (path) => {
    try {
      if (window && window.history && typeof window.history.pushState === 'function') {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new CustomEvent('navigation', { detail: { path } }));
        setMenuOpen(false);
      } else if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    } catch (err) {
      // no-op
    }
  };

  const handleLogout = () => {
    if (typeof logout === 'function') return logout();
    // fallback: clear token and navigate
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try { window.dispatchEvent(new CustomEvent('navigation', { detail: { path: '/login' } })); } catch(e) {}
  };

  return (
    <nav className="home-nav">
      <div className="home-brand">
        <h2 onClick={() => navigate('/')} style={{cursor:'pointer'}}>Flower Delivery</h2>
      </div>

      <button className="nav-toggle btn btn-ghost" onClick={() => setMenuOpen(prev => !prev)} aria-expanded={menuOpen} aria-label="Toggle menu">☰</button>

      <div className="home-cta">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Home</button>
        <button className="btn btn-ghost" onClick={() => navigate('/categories')}>Categories</button>
        {user ? (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
            {user.role === 'buyer' && (
              <>
                <button className="btn btn-ghost" onClick={() => navigate('/orders')}>View Orders</button>
                <button className="btn btn-ghost" onClick={() => navigate('/cart')}>Cart</button>
              </>
            )}
            {user.role === 'florist' && (
              <button className="btn btn-ghost" onClick={() => navigate('/orders')}>Orders</button>
            )}
            <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="menu" aria-hidden={!menuOpen}>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Home</button>
        <button className="btn btn-ghost" onClick={() => navigate('/categories')}>Categories</button>
        {user && <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>}
        {user && user.role === 'buyer' && (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/orders')}>View Orders</button>
            <button className="btn btn-ghost" onClick={() => navigate('/cart')}>Cart</button>
          </>
        )}
        {user && user.role === 'florist' && (
          <button className="btn btn-ghost" onClick={() => navigate('/orders')}>Orders</button>
        )}
        {user ? (
          <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}
