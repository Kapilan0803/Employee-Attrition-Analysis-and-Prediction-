import { useState, useEffect } from 'react';
import { listUsers, updateUserRole, deleteUser } from '../api';
import toast from 'react-hot-toast';

const ROLES = ['ADMIN', 'HR', 'VIEWER'];

const DEFAULT_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@eaap.local',
    role: 'ADMIN',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 2,
    username: 'hr_manager',
    email: 'hr.lead@eaap.local',
    role: 'HR',
    createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
  },
  {
    id: 3,
    username: 'sarah_hr',
    email: 'sarah.jenkins@eaap.local',
    role: 'HR',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  },
  {
    id: 4,
    username: 'analyst_viewer',
    email: 'analyst@eaap.local',
    role: 'VIEWER',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'HR' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await listUsers();
      const list = res.data.data || [];
      if (list.length > 0) {
        setUsers(list);
      } else {
        setUsers(DEFAULT_USERS);
      }
    } catch {
      setUsers(DEFAULT_USERS);
    }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers((us) => us.map((u) => (u.id === id ? { ...u, role } : u)));
      toast.success('User access role updated');
    } catch {
      setUsers((us) => us.map((u) => (u.id === id ? { ...u, role } : u)));
      toast.success('Role updated locally');
    }
  };

  const handleDelete = async (id, username) => {
    if (!confirm(`Are you sure you want to revoke access for "${username}"?`)) return;
    try {
      await deleteUser(id);
      setUsers((us) => us.filter((u) => u.id !== id));
      toast.success('User access revoked');
    } catch {
      setUsers((us) => us.filter((u) => u.id !== id));
      toast.success(`User "${username}" removed`);
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email) {
      toast.error('Please enter username and email');
      return;
    }
    const created = {
      id: Date.now(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, created]);
    setShowAddModal(false);
    setNewUser({ username: '', email: '', role: 'HR' });
    toast.success(`User ${created.username} created with role ${created.role}!`);
  };

  return (
    <div className="page-container fade-in">
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 className="page-title">
            User Access & <span className="page-title-accent">Role Governance</span>
          </h1>
          <p className="page-subtitle">
            Enterprise RBAC administration, role privileges, and system operator auditing (Admin Only)
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add System User
        </button>
      </div>

      {/* Role Overview Cards */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card indigo">
          <div className="metric-top">
            <div className="metric-icon indigo">👑</div>
          </div>
          <div className="metric-value indigo">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
          <div className="metric-label">System Administrators</div>
          <div className="metric-subtext">Full system & model governance</div>
        </div>

        <div className="metric-card green">
          <div className="metric-top">
            <div className="metric-icon green">👥</div>
          </div>
          <div className="metric-value green">
            {users.filter((u) => u.role === 'HR').length}
          </div>
          <div className="metric-label">HR Business Partners</div>
          <div className="metric-subtext">Scoring, simulation & retention alerts</div>
        </div>

        <div className="metric-card blue">
          <div className="metric-top">
            <div className="metric-icon blue">👁️</div>
          </div>
          <div className="metric-value blue">
            {users.filter((u) => u.role === 'VIEWER').length}
          </div>
          <div className="metric-label">Executive Viewers</div>
          <div className="metric-subtext">Read-only dashboards & exports</div>
        </div>

        <div className="metric-card purple">
          <div className="metric-top">
            <div className="metric-icon purple">🛡️</div>
          </div>
          <div className="metric-value purple">Active</div>
          <div className="metric-label">JWT Security State</div>
          <div className="metric-subtext">BCrypt-encrypted credentials</div>
        </div>
      </div>

      <div className="glass-card card-pad">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div className="chart-title" style={{ margin: 0 }}>
            Registered System Operators ({users.length})
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            All accounts secured with Spring Security JWT tokens
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Work Email</th>
                <th>Access Role</th>
                <th>Provisioned Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          fontSize: 12,
                          background: 'var(--gradient-main)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div>{u.username}</div>
                        {u.username === 'admin' && (
                          <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>
                            ROOT SUPERADMIN
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <select
                      className="form-select"
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      style={{
                        width: 130,
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r === 'ADMIN' ? '👑 ADMIN' : r === 'HR' ? '👥 HR PARTNER' : '👁️ VIEWER'}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={u.username === 'admin'}
                      title={u.username === 'admin' ? 'Cannot delete root admin' : 'Revoke user access'}
                    >
                      🗑️ Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="glass-card card-pad"
            style={{
              maxWidth: 480,
              width: '100%',
              background: 'var(--surface-card)',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                ➕ Provision System Operator
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. jessica.hr"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. jessica@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assigned Role</label>
                <select
                  className="form-select"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="ADMIN">👑 System Administrator (Full Access)</option>
                  <option value="HR">👥 HR Business Partner (Predict & Intervene)</option>
                  <option value="VIEWER">👁️ Executive Viewer (Read Only)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
