import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.username, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb" />
      <div className="login-bg-orb" />
      <div className="login-bg-orb" />

      <div className="login-card fade-in">
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <h1>EAAP</h1>
          <p>Employee Attrition Analysis &amp; Prediction</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '11px 14px', borderRadius: 8,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              fontSize: 13, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <div className="login-creds">
          <p>Demo Credentials</p>
          <code>admin / admin123 — Full Access</code>
          <code>hr_manager / hr123 — HR Access</code>
          <code>viewer / view123 — Read Only</code>
        </div>
      </div>
    </div>
  );
}
