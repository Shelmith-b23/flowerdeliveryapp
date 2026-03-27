// src/pages/Checkout.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

export default function Checkout({ user }) {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    buyer_name: user?.name || "",
    buyer_phone: "",
    delivery_address: ""
  });
  
  const [paymentMethod, setPaymentMethod] = useState("mpesa"); // Default to M-Pesa
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  const handleCreateOrder = async () => {
    if (!deliveryInfo.buyer_name || !deliveryInfo.buyer_phone || !deliveryInfo.delivery_address) {
      return alert("Please complete all delivery fields.");
    }
    
    setLoading(true);
    try {
      const items = cartItems.map(item => ({ 
        flower_id: item.id, 
        quantity: item.quantity 
      }));
      
      const res = await api.post("/orders/create", { 
        ...deliveryInfo, 
        items,
        payment_method: paymentMethod // Sending payment choice to backend
      });
      
      setOrderCreated(res.data);
      clearCart(); 
    } catch (err) {
      alert(err.response?.data?.error || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderCreated) {
    return (
      <div className="checkout-empty" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1 className="empty-title-serif">Your bag is empty.</h1>
        <Link to="/browse" className="btn-fora btn-outline">Return to Collection</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={{ background: '#FFF', minHeight: '100vh' }}>
      <nav className="bd-header-refined" style={{ padding: '30px 60px', borderBottom: '1px solid #F0F0F0' }}>
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none', color: '#1A1A1A', fontSize: '1.2rem', fontWeight: '800' }}>FLORA X.</Link>
        <span className="text-uppercase" style={{ fontSize: '9px', letterSpacing: '2px', marginLeft: '30px', color: '#717171' }}>Secure Checkout</span>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 40px' }}>
        {orderCreated ? (
          <div className="order-success-editorial" style={{ textAlign: 'center', padding: '60px 0' }}>
            <span className="text-uppercase" style={{ color: '#4A5D4E', fontSize: '10px', fontWeight: '700', letterSpacing: '2px' }}>Request Received</span>
            <h1 className="empty-title-serif" style={{ fontSize: '3.5rem', margin: '20px 0' }}>Awaiting Preparation.</h1>
            <p style={{ color: '#717171', maxWidth: '450px', margin: '0 auto 40px' }}>Order #{orderCreated.order_id} is being curated. Please check your phone for the {paymentMethod === 'mpesa' ? 'M-Pesa prompt' : 'payment instructions'}.</p>
            <button className="btn-fora" onClick={() => navigate('/buyer-dashboard')}>Monitor Progress</button>
          </div>
        ) : (
          <div className="checkout-grid-editorial" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '100px' }}>
            
            {/* LEFT COLUMN: DELIVERY & PAYMENT */}
            <section>
              <h2 className="text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px', marginBottom: '40px' }}>I. Delivery Details</h2>
              <div style={{ display: 'grid', gap: '25px' }}>
                <div className="form-group-editorial">
                  <label style={{ fontSize: '9px', textTransform: 'uppercase', color: '#717171' }}>Full Name</label>
                  <input type="text" className="fora-input-minimal" value={deliveryInfo.buyer_name} onChange={(e) => setDeliveryInfo({...deliveryInfo, buyer_name: e.target.value})} />
                </div>
                <div className="form-group-editorial">
                  <label style={{ fontSize: '9px', textTransform: 'uppercase', color: '#717171' }}>Mobile Number</label>
                  <input type="tel" className="fora-input-minimal" placeholder="+254..." value={deliveryInfo.buyer_phone} onChange={(e) => setDeliveryInfo({...deliveryInfo, buyer_phone: e.target.value})} />
                </div>
                <div className="form-group-editorial">
                  <label style={{ fontSize: '9px', textTransform: 'uppercase', color: '#717171' }}>Shipping Address</label>
                  <textarea className="fora-input-minimal" rows="2" value={deliveryInfo.delivery_address} onChange={(e) => setDeliveryInfo({...deliveryInfo, delivery_address: e.target.value})} />
                </div>
              </div>

              <h2 className="text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px', margin: '60px 0 40px' }}>II. Payment Method</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* M-PESA OPTION */}
                <div 
                  onClick={() => setPaymentMethod('mpesa')}
                  style={{ 
                    padding: '25px', border: `1px solid ${paymentMethod === 'mpesa' ? '#1A1A1A' : '#EEE'}`, 
                    cursor: 'pointer', textAlign: 'center', transition: '0.3s' 
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '5px' }}>M-PESA</div>
                  <div style={{ fontSize: '10px', color: '#717171' }}>Mobile Money Transfer</div>
                </div>

                {/* CARD OPTION */}
                <div 
                  onClick={() => setPaymentMethod('card')}
                  style={{ 
                    padding: '25px', border: `1px solid ${paymentMethod === 'card' ? '#1A1A1A' : '#EEE'}`, 
                    cursor: 'pointer', textAlign: 'center', transition: '0.3s' 
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '5px' }}>CARD</div>
                  <div style={{ fontSize: '10px', color: '#717171' }}>Visa / Mastercard</div>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: SIDEBAR SUMMARY */}
            <aside>
              <div style={{ background: '#FBFBFB', padding: '40px', position: 'sticky', top: '40px' }}>
                <h3 className="text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px', marginBottom: '30px', color: '#717171' }}>Selection Summary</h3>
                <div style={{ marginBottom: '30px' }}>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '13px' }}>
                      <span>{item.name} <span style={{ color: '#BBB', marginLeft: '5px' }}>×{item.quantity}</span></span>
                      <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #EEE', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                  <span style={{ fontWeight: '700' }}>TOTAL</span>
                  <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>KSh {subtotal.toLocaleString()}</span>
                </div>
                <button 
                  className="btn-fora" 
                  style={{ width: '100%', background: '#1A1A1A', color: '#FFF', padding: '20px', border: 'none', cursor: 'pointer', fontWeight: '600' }} 
                  onClick={handleCreateOrder} 
                  disabled={loading}
                >
                  {loading ? "PROCESING..." : paymentMethod === 'mpesa' ? "SEND STK PUSH" : "PROCEED TO SECURE CARD"}
                </button>
              </div>
            </aside>

          </div>
        )}
      </main>
    </div>
  );
}