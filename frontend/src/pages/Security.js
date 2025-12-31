import React, { useState } from 'react';
import api from '../api/axios';
import TopNav from '../components/TopNav';   // ✅ import navbar
import './Security.css';

export default function Security({ user, setUser, logout }) {
  const [qr, setQr] = useState(null);
  const [otpauth, setOtpauth] = useState(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const setup = async () => {
    setMessage('');
    setQr(null);
    setOtpauth(null);
    try {
      setLoading(true);
      const res = await api.post('/auth/totp/setup');
      setQr(res.data.qr_code);
      setOtpauth(res.data.otpauth_url);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to start TOTP setup');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!code) return setMessage('Please enter the code from your authenticator');
    try {
      setLoading(true);
      await api.post('/auth/totp/verify', { code });

      setMessage('TOTP enabled.');

      const profile = await api.get('/auth/me').catch(() => null);
      if (profile?.data?.user) {
        setUser(profile.data.user);
      } else {
        setUser(u => ({ ...u, totp_enabled: true }));
      }

      setQr(null);
      setOtpauth(null);
      setCode('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    if (!window.confirm('Disable 2FA? You will need a current code.')) return;
    const c = window.prompt('Enter current code');
    if (!c) return;

    try {
      setLoading(true);
      await api.post('/auth/totp/disable', { code: c });

      setMessage('TOTP disabled');

      const profile = await api.get('/auth/me').catch(() => null);
      if (profile?.data?.user) setUser(profile.data.user);
      else setUser(u => ({ ...u, totp_enabled: false }));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Disable failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Reusable Navbar */}
      <TopNav user={user} logout={logout} />

      {/* 🔐 Security Page Content */}
      <div className="security-page container">
        <h1>Security Settings</h1>
        <p>Manage two-factor authentication (Google Authenticator).</p>

        {message && <div className="sec-msg">{message}</div>}

        {user?.totp_enabled ? (
          <div className="sec-block">
            <h3>Two-factor authentication is enabled</h3>
            <button
              className="btn btn-ghost"
              onClick={disable}
              disabled={loading}
            >
              Disable 2FA
            </button>
          </div>
        ) : (
          <div className="sec-block">
            <h3>Enable two-factor authentication</h3>
            <p>We use TOTP (Google Authenticator or similar).</p>

            <button
              className="btn btn-ghost"
              onClick={setup}
              disabled={loading}
            >
              Setup
            </button>

            {qr && (
              <div className="qr-wrap">
                <img src={qr} alt="TOTP QR" />
                <p className="muted">
                  Scan with Google Authenticator or use the URL below.
                </p>

                <div className="otpauth">{otpauth}</div>

                <input
                  placeholder="Enter code from app"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="auth-input"
                />

                <button
                  className="auth-button"
                  onClick={verify}
                  disabled={loading}
                >
                  Verify & Enable
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
