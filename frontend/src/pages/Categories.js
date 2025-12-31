import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import TopNav from '../components/TopNav';
import OrderForm from '../components/OrderForm';
import './Categories.css';

// ------------------ FlowerCard ------------------
const FlowerCard = React.memo(({ f, user }) => (
  <div className="cat-flower-card">
    <div className="img">
      {f.image_url ? <img src={f.image_url} alt={f.name || "Flower"} /> : <div className="noimg">No image</div>}
    </div>
    <div className="info">
      <div className="name">{f.name}</div>
      <div className="desc">{f.description?.slice(0, 80)}</div>
      <div className="price">${f.price?.toFixed ? f.price.toFixed(2) : f.price}</div>
      {user?.role === 'buyer' && <OrderForm user={user} flower={f} />}
    </div>
  </div>
));

// ------------------ Categories Page ------------------
export default function Categories({ user, logout }) {
  const [list, setList] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api.get('/flowers/by_florist')
      .then(res => { if (!cancelled) setList(res.data || []); })
      .catch(e => { if (!cancelled) setErr(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ------------------ Filtered Flowers ------------------
  const filtered = useMemo(() => {
    if (!query) return list;
    const q = query.toLowerCase();

    return list.map(florist => ({
      ...florist,
      flowers: florist.flowers.filter(f => (f.name || '').toLowerCase().includes(q))
    })).filter(f => f.flowers.length > 0);
  }, [list, query]);

  if (err) return <p style={{ color: 'red' }}>Unable to load categories.</p>;
  if (loading) return <p>Loading categories…</p>;

  return (
    <div className="categories-page">
      <TopNav user={user} logout={logout} />
      <h1>Florists & Their Collections</h1>

      <div className="search-box">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search flowers (e.g. roses, lilies)"
        />
      </div>

      {filtered.length === 0 ? (
        <p>No results match your search.</p>
      ) : (
        filtered.map(florist => (
          <section className="florist-section" key={florist.florist_id}>
            <h2 className="florist-name">{florist.florist_name}</h2>
            {florist.flowers.length ? (
              <div className="flowers-grid">
                {florist.flowers.map(f => <FlowerCard key={f.id} f={f} user={user} />)}
              </div>
            ) : (
              <p className="no-flowers">No flowers available</p>
            )}
          </section>
        ))
      )}
    </div>
  );
}
