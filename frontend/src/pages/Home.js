import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Home({ user, setUser }) {
  // Lightweight navigate helper to avoid a react-router-dom dependency in dev
  const navigate = (path) => {
    try {
      if (window && window.history && typeof window.history.pushState === 'function') {
        window.history.pushState({}, '', path);
      } else if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    } catch (err) {
      // no-op
    }
  }; // fallback if outside router

  // Small card component
  const FlowerCard = ({ f }) => (
    <div style={{ width: 180, border: '1px solid #eee', borderRadius: 8, padding: 10, textAlign: 'left' }}>
      <div style={{ height: 100, marginBottom: 8, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {f.image_url ? <img src={f.image_url} alt={f.name} style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: 6 }} /> : <span style={{ color: '#888' }}>No image</span>}
      </div>
      <div style={{ fontWeight: 'bold' }}>{f.name}</div>
      <div style={{ color: '#666', fontSize: 12 }}>{f.description?.slice(0, 60)}</div>
      <div style={{ marginTop: 8, fontWeight: 'bold' }}>${f.price?.toFixed ? f.price.toFixed(2) : f.price}</div>
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
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {items.map(f => <FlowerCard key={f.id} f={f} />)}
      </div>
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
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {items.map(f => <FlowerCard key={f.id} f={f} />)}
      </div>
    );
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser?.(null); // safe in case setUser is undefined
    navigate?.("/login");
  };

  return (
    <div>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
        }}
      >
        <h2 style={{ cursor: "pointer" }} onClick={() => navigate?.("/")}>
          Flower Delivery
        </h2>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {user ? (
            <>
              {user.role === "buyer" && (
                <>
                  <button onClick={() => navigate("/categories")} style={navButtonStyle}>
                    Categories
                  </button>
                  <button onClick={() => navigate("/cart")} style={navButtonStyle}>
                    Cart
                  </button>
                </>
              )}

              {user.role === "florist" && (
                <>
                  <button onClick={() => navigate("/orders")} style={navButtonStyle}>
                    Orders
                  </button>
                  <button onClick={() => navigate("/categories")} style={navButtonStyle}>
                    Categories
                  </button>
                </>
              )}

              <button onClick={handleLogout} style={navButtonStyle}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} style={navButtonStyle}>
                Login
              </button>
              <button onClick={() => navigate("/register")} style={navButtonStyle}>
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Page content */}
      <main style={{ padding: "40px" }}>
        <h1 style={{ textAlign: 'center' }}>Welcome to Flower Delivery App</h1>

        <section style={{ marginTop: 30 }}>
          <h2>Best Selling</h2>
          <BestSelling />
        </section>

        <section style={{ marginTop: 30 }}>
          <h2>New Arrivals</h2>
          <NewArrivals />
        </section>
      </main>
    </div>
  );
}

// Reusable style for navbar buttons
const navButtonStyle = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#fff",
  color: "#4CAF50",
  cursor: "pointer",
  fontWeight: "bold",
};
