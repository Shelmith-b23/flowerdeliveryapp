import React, { useState } from 'react';
import api from '../api/axios';
import './Security.css';

export default function Security({ user, setUser }) {
  const [qr, setQr] = useState(null);
  const [otpauth, setOtpauth] = useState(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const setup = async () => {
    setMessage(''); setQr(null); setOtpauth(null);
    try {
      setLoading(true);
      const res = await api.post('/auth/totp/setup');
      setQr(res.data.qr_code);
      setOtpauth(res.data.otpauth_url);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to start TOTP setup');
    } finally { setLoading(false); }
  };

  const verify = async () => {
    if (!code) return setMessage('Please enter the code from your authenticator');
    try {
      setLoading(true);
      await api.post('/auth/totp/verify', { code });
      setMessage('TOTP enabled.');
      // Refresh user profile by re-fetching from server
      const token = localStorage.getItem('token');
      if (token) {
        const profile = await api.get('/auth/me').catch(() => null);
        if (profile?.data?.user) {
          setUser(profile.data.user);
        } else {
          setUser(u => ({ ...u, totp_enabled: true }));
        }
      } else {
        setUser(u => ({ ...u, totp_enabled: true }));
      }

      setQr(null);
      setOtpauth(null);
      setCode('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Verification failed');
    } finally { setLoading(false); }
  };

  const disable = async () => {
    if (!window.confirm('Disable 2FA? You will need your password and a current code to confirm.')) return;
    const c = window.prompt('Enter current code to disable 2FA');
    if (!c) return;
    try {
      setLoading(true);
      await api.post('/auth/totp/disable', { code: c });
      setMessage('TOTP disabled');
      // refresh profile
      const profile = await api.get('/auth/me').catch(() => null);
      if (profile?.data?.user) setUser(profile.data.user);
      else setUser(u => ({ ...u, totp_enabled: false }));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Disable failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="security-page container">
      <h1>Security Settings</h1>
      <p>Manage two-factor authentication (Google Authenticator).</p>

      {message && <div className="sec-msg">{message}</div>}

      {user?.totp_enabled ? (
        <div className="sec-block">
          <h3>Two-factor authentication is currently enabled</h3>
          <button className="btn btn-ghost" onClick={disable} disabled={loading}>Disable 2FA</button>
        </div>
      ) : (
        <div className="sec-block">
          <h3>Enable two-factor authentication</h3>
          <p>We use TOTP (Google Authenticator or similar). Click "Setup" to begin.</p>
          <div className="sec-actions">
            <button className="btn btn-ghost" onClick={setup} disabled={loading}>Setup</button>
          </div>

          {qr && (
            <div className="qr-wrap">
              <img src={qr} alt="TOTP QR" />
              <p className="muted">Scan this QR with Google Authenticator. If you prefer, use provisioning URL below.</p>
              <div className="otpauth">{otpauth}</div>

              <div style={{ marginTop: 8 }}>
                <input placeholder="Enter code from app" value={code} onChange={e => setCode(e.target.value)} className="auth-input" />
                <div style={{ marginTop: 8 }}>
                  <button className="auth-button" onClick={verify} disabled={loading}>Verify & Enable</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
