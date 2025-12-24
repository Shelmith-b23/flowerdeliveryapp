import { useState } from "react";
import api from "../api/axios";
import './Auth.css';

export default function Login({ setUser, toggleRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setTotpRequired(false);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      setUser(user);
    } catch (err) {
      const data = err.response?.data;
      if (data?.['2fa_required']) {
        setTotpRequired(true);
        setError('Two-factor code required. Enter the code from your authenticator.');
      } else {
        setError(data?.error || 'Invalid credentials');
      }
    } finally { setLoading(false); }
  };

  const submitTotp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, totp: totpCode });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      setUser(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid 2FA code');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-input-group">
          <input className="auth-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="auth-input-group">
          <input className="auth-input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {totpRequired && (
          <div className="auth-input-group">
            <label>2FA Code</label>
            <input className="auth-input" placeholder="123456" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
            <div style={{ marginTop: 8 }}>
              <button className="auth-button" onClick={submitTotp} disabled={loading}>Submit 2FA</button>
            </div>
          </div>
        )}

        {!totpRequired && (
          <button className="auth-button" onClick={handleLogin} disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        )}

        <p className="auth-toggle">Don't have an account? <span className="auth-link" onClick={toggleRegister}>Register</span></p>
      </div>
    </div>
  );
}
