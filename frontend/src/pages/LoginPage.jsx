import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLoginWith = async (username, password) => {
    setForm({ username, password });
    setError('');
    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleLoginWith(form.username, form.password);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb" />
      <div className="login-bg-orb" />
      <div className="login-bg-orb" />

      <div className="login-card fade-in">
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <h1>EAAP Platform</h1>
          <p>Employee Attrition Analysis &amp; Prediction</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter username"
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
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: 13, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Authenticating...</> : 'Sign In to Workspace →'}
          </button>
        </form>

        <div className="login-creds-container">
          <div className="login-creds-title">Instant Demo Access (Click to Sign In)</div>
          <div className="demo-account-buttons">
            <button
              type="button"
              className="demo-account-btn"
              onClick={() => handleLoginWith('admin', 'admin123')}
              disabled={loading}
            >
              <div>
                <div className="demo-role">⚡ Administrator</div>
                <div className="demo-sub">admin / admin123</div>
              </div>
              <span className="badge badge-purple">Full Access</span>
            </button>

            <button
              type="button"
              className="demo-account-btn"
              onClick={() => handleLoginWith('hr_manager', 'hr123')}
              disabled={loading}
            >
              <div>
                <div className="demo-role">💼 HR Manager</div>
                <div className="demo-sub">hr_manager / hr123</div>
              </div>
              <span className="badge badge-blue">Analytics &amp; ML</span>
            </button>

            <button
              type="button"
              className="demo-account-btn"
              onClick={() => handleLoginWith('viewer', 'view123')}
              disabled={loading}
            >
              <div>
                <div className="demo-role">👁️ Executive Viewer</div>
                <div className="demo-sub">viewer / view123</div>
              </div>
              <span className="badge badge-low">Read Only</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
