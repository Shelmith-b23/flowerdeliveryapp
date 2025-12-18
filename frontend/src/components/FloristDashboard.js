import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import FlowerList from "./FlowerList";
import MessageBox from "./MessageBox";
import LiveTracking from "./LiveTracking";

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
    <div>
      {/* 🔐 Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Welcome, {user.name}</h1>
        <button
          onClick={api.logout}
          style={{
            padding: "8px 14px",
            backgroundColor: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Flowers management */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Your Flowers</h2>
          <div>
            <button onClick={() => { setShowAddForm(prev => !prev); setEditing(null); }} style={{ marginRight: 8 }}>
              {showAddForm ? 'Hide' : 'Add Flower'}
            </button>
            <button onClick={fetchFlowers}>Refresh</button>
          </div>
        </div>

        {opError && <div style={{ color: 'red' }}>{opError}</div>}

        {showAddForm && (
          <FlowerForm onSave={createFlower} onCancel={() => setShowAddForm(false)} />
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          {flowers.map(f => (
            <div key={f.id} style={{ width: 220, border: '1px solid #ccc', borderRadius: 6, padding: 10 }}>
              <div style={{ height: 110, marginBottom: 8, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {f.image_url ? <img src={f.image_url} alt={f.name} style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: 6 }} /> : <span style={{ color: '#888' }}>No image</span>}
              </div>
              <div style={{ fontWeight: 'bold' }}>{f.name}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{f.description?.slice(0, 80)}</div>
              <div style={{ marginTop: 8, fontWeight: 'bold' }}>${f.price?.toFixed ? f.price.toFixed(2) : f.price}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditing(f); setShowAddForm(false); }} style={{ padding: '6px 8px' }}>Edit</button>
                <button onClick={() => deleteFlower(f.id)} style={{ padding: '6px 8px', background: '#e74c3c', color: 'white' }}>Delete</button>
              </div>
              {editing && editing.id === f.id && (
                <FlowerForm initial={editing} onSave={(id, payload) => updateFlower(id, payload)} onCancel={() => setEditing(null)} />
              )}
            </div>
          ))}
        </div>
      </div>

      <FlowerList user={user} />

      <h2>Your Orders</h2>
      {orders.map((o) => (
        <div
          key={o.id}
          style={{ border: "1px solid #ccc", margin: "5px", padding: "10px" }}
        >
          <p>
            Order #{o.id} – <strong>{o.status}</strong>
          </p>

          <MessageBox orderId={o.id} userId={user.id} />

          {o.delivery_lat && o.delivery_lng && (
            <LiveTracking order={o} />
          )}

          {o.status !== "delivered" && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => markDelivered(o.id)} style={{ padding: '6px 10px', cursor: 'pointer' }}>
                Mark Delivered
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
