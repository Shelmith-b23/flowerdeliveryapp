import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import FlowerList from "./FlowerList";
import MessageBox from "./MessageBox";
import LiveTracking from "./LiveTracking";
import './FloristDashboard.css';

export default function FloristDashboard({ user }) {
  const [flowers, setFlowers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [opError, setOpError] = useState(null);

  const fetchFlowers = useCallback(async () => {
    try {
      const res = await api.get(`/flowers/florist/${user.id}`);
      setFlowers(res.data || []);
    } catch (err) {
      setOpError('Unable to load your flowers');
    }
  }, [user.id]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get(`/orders/florist/${user.id}`);
      setOrders(res.data || []);
    } catch (err) {
      // quietly ignore; orders will show as empty
    }
  }, [user.id]);

  useEffect(() => {
    fetchFlowers();
    fetchOrders();
    const interval = setInterval(() => { fetchOrders(); }, 5000);
    return () => clearInterval(interval);
  }, [fetchFlowers, fetchOrders]);

  const markDelivered = useCallback(async (orderId) => {
    await api.put(`/orders/${orderId}`, { status: "delivered" });
    fetchOrders();
  }, [fetchOrders]);

  const createFlower = useCallback(async (payload) => {
    await api.post('/flowers', payload);
    await fetchFlowers();
  }, [fetchFlowers]);

  const updateFlower = useCallback(async (id, payload) => {
    await api.put(`/flowers/${id}`, payload);
    await fetchFlowers();
  }, [fetchFlowers]);

  const deleteFlower = useCallback(async (id) => {
    if (!window.confirm('Delete this flower?')) return;
    await api.delete(`/flowers/${id}`);
    await fetchFlowers();
  }, [fetchFlowers]);

  const FlowerForm = ({ initial = null, onSave, onCancel }) => {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [price, setPrice] = useState(initial?.price ? String(initial.price) : '0.00');
    const [image_url, setImageUrl] = useState(initial?.image_url || '');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState(null);

    const save = async () => {
      setSaving(true); setErr(null);
      try {
        const payload = { name, description, price: parseFloat(price), image_url, florist_id: user.id };
        if (initial && initial.id) {
          await onSave(initial.id, payload);
        } else {
          await onSave(payload);
        }
        onCancel();
      } catch (e) {
        setErr('Save failed');
      } finally { setSaving(false); }
    };

    return (
      <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={{ width: 80 }} />
          <input placeholder="Image URL" value={image_url} onChange={e => setImageUrl(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={save} disabled={saving} style={{ marginRight: 8 }}>{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={onCancel}>Cancel</button>
          {err && <div style={{ color: 'red' }}>{err}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="fd-container">
      <header className="fd-header">
        <div>
          <h1>Welcome, {user.name}</h1>
          <div className="sub">Florist dashboard</div>
        </div>
        <div>
          <button className="fd-logout" onClick={api.logout}>Logout</button>
        </div>
      </header>

      <section className="fd-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Your Flowers</h2>
          <div className="fd-actions">
            <button className="fd-btn primary" onClick={() => { setShowAddForm(prev => !prev); setEditing(null); }}>
              {showAddForm ? 'Hide' : 'Add Flower'}
            </button>
            <button className="fd-btn" onClick={fetchFlowers}>Refresh</button>
          </div>
        </div>

        {opError && <div style={{ color: 'red', marginTop: 8 }}>{opError}</div>}

        {/* Modal for add/edit */}
        {(showAddForm || editing) && (
          <div className="fd-modal-overlay" onClick={() => { setShowAddForm(false); setEditing(null); }}>
            <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>{editing ? 'Edit Flower' : 'Add Flower'}</h3>
              <FlowerForm initial={editing} onSave={editing ? ( (id,p) => updateFlower(id,p) ) : ( p => createFlower(p) )} onCancel={() => { setShowAddForm(false); setEditing(null); }} />
            </div>
          </div>
        )}

        <div className="fd-grid">
          {flowers.map(f => (
            <div key={f.id} className="fd-card">
              <div className="img">{f.image_url ? <img src={f.image_url} alt={f.name} /> : <span style={{ color: '#888' }}>No image</span>}</div>
              <div className="body">
                <div className="title">{f.name}</div>
                <div className="desc">{f.description?.slice(0, 80)}</div>
                <div className="price">${f.price?.toFixed ? f.price.toFixed(2) : f.price}</div>
                <div className="actions">
                  <button className="btn" onClick={() => { setEditing(f); setShowAddForm(false); }}>Edit</button>
                  <button className="btn danger" onClick={() => deleteFlower(f.id)}>Delete</button>
                </div>
                {editing && editing.id === f.id && (
                  <div style={{ marginTop: 12 }}>
                    <FlowerForm initial={editing} onSave={(id, payload) => updateFlower(id, payload)} onCancel={() => setEditing(null)} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <FlowerList user={user} />
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Your Orders</h2>
        <div className="fd-orders">
          {orders.map((o) => (
            <div key={o.id} className="fd-order">
              <div className="meta">
                <div>
                  <div style={{ fontWeight: 700 }}>Order #{o.id}</div>
                  <div className="status">{o.status}</div>
                </div>
                <div>
                  {o.status !== 'delivered' && (
                    <button className="deliver" onClick={() => markDelivered(o.id)}>Mark Delivered</button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <MessageBox orderId={o.id} userId={user.id} />
              </div>

              {o.delivery_lat && o.delivery_lng && (
                <div style={{ marginTop: 10 }}>
                  <LiveTracking order={o} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
