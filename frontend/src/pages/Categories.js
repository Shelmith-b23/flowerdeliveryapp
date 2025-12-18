import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './Categories.css';
import OrderForm from '../components/OrderForm';
import TopNav from '../components/TopNav';
import { useMemo } from 'react';

function FlowerCard({ f, user }) {
  return (
    <div className="cat-flower-card">
      <div className="img">{f.image_url ? <img src={f.image_url} alt={f.name} /> : <div className="noimg">No image</div>}</div>
      <div className="info">
        <div className="name">{f.name}</div>
        <div className="desc">{f.description?.slice(0, 80)}</div>
        <div className="price">${f.price?.toFixed ? f.price.toFixed(2) : f.price}</div>
        {user?.role === 'buyer' && <OrderForm user={user} flower={f} />}
      </div>
    </div>
  );
}

export default function Categories({ user, logout }) {
  const [list, setList] = useState([]);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get('/flowers/by_florist')
      .then(res => { if (!cancelled) setList(res.data || []); })
      .catch(e => { setErr(e); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!query) return list;
    const q = query.toLowerCase();
    return list.map(f => ({
      ...f,
      flowers: f.flowers.filter(fl => (fl.name || '').toLowerCase().includes(q))
    })).filter(f => f.flowers.length > 0);
  }, [list, query]);

  if (err) return <p style={{ color: 'red' }}>Unable to load categories.</p>;
  if (!list.length) return <p>Loading categories…</p>;

  return (
    <div className="categories-page">
      <TopNav user={user} logout={logout} />
      <h1>Florists & Their Collections</h1>

      <div style={{ marginBottom: 12 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search flowers (e.g. roses, lilies)" style={{ padding: '8px 10px', width: '100%', maxWidth: 420 }} />
      </div>

      {filtered.length === 0 ? (
        <p>No results match your search.</p>
      ) : (
        filtered.map(florist => (
          <section className="florist-section" key={florist.florist_id}>
            <h2 className="florist-name">{florist.florist_name}</h2>
            <div className="flowers-grid">
              {florist.flowers.length ? florist.flowers.map(f => (
                <FlowerCard key={f.id} f={f} user={user} />
              )) : <p className="no-flowers">No flowers available</p>}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
