import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './Home.css';
import TopNav from '../components/TopNav';


export default function Home({ user, setUser, logout }) {


  // Small card component (styled)
  const FlowerCard = ({ f }) => (
    <div className="flower-card">
      <div className="img">{f.image_url ? <img src={f.image_url} alt={f.name} /> : <span style={{ color: '#888' }}>No image</span>}</div>
      <div className="content">
        <div className="name">{f.name}</div>
        <div className="desc">{f.description?.slice(0, 60)}</div>
        <div className="price">${f.price?.toFixed ? f.price.toFixed(2) : f.price}</div>
      </div>
    </div>
  );

  const BestSelling = () => {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState(null);
    useEffect(() => {
      let cancelled = false;
      api.get('/flowers/best_selling')
        .then(r => { if (!cancelled) setItems(r.data || []); })
        .catch(e => { setErr(e); });
      return () => { cancelled = true; };
    }, []);

    if (err) return <p style={{ color: 'red' }}>Unable to load best selling items.</p>;
    if (!items.length) return <p>Loading best selling...</p>;
    return (
      <>
        {items.map(f => <FlowerCard key={f.id} f={f} />)}
      </>
    );
  };

  const NewArrivals = () => {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState(null);
    useEffect(() => {
      let cancelled = false;
      api.get('/flowers')
        .then(r => { if (!cancelled) setItems((r.data || []).slice(0,6)); })
        .catch(e => { setErr(e); });
      return () => { cancelled = true; };
    }, []);

    if (err) return <p style={{ color: 'red' }}>Unable to load new arrivals.</p>;
    if (!items.length) return <p>Loading new arrivals...</p>;
    return (
      <>
        {items.map(f => <FlowerCard key={f.id} f={f} />)}
      </>
    );
  };


  const handleLogout = () => {
    // Prefer parent-provided logout handler (from App) to keep state consistent
    if (typeof logout === 'function') {
      logout();
      try {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new CustomEvent('navigation', { detail: { path: '/login' } }));
      } catch (e) {}
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    try { api.setAuthToken(null); } catch (e) {}
    setUser?.(null); // safe in case setUser is undefined
    try {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new CustomEvent('navigation', { detail: { path: '/login' } }));
    } catch (e) {}
  };

  return (
    <div className="home-container">
      <TopNav user={user} logout={handleLogout} />

      {/* Hero */}
      <div className="home-hero">
        <h1>Welcome to Flower Delivery</h1>
        <p>Handpicked blooms, delivered with care — shop our best selling collections and new arrivals.</p>
      </div>


      {/* Page content */}
      <main>
        <section className="section">
          <h2>Best Selling</h2>
          <div className="flowers-grid"><BestSelling /></div>
        </section>

        <section className="section">
          <h2>New Arrivals</h2>
          <div className="flowers-grid"><NewArrivals /></div>
        </section>
      </main>
    </div>
  );
}


