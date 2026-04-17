import { useState, useEffect } from 'react';
import { listUsers, updateUserRole, deleteUser } from '../api';
import toast from 'react-hot-toast';

const ROLES = ['ADMIN', 'HR', 'VIEWER'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(res.data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers(us => us.map(u => u.id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (id, username) => {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
      await deleteUser(id);
      setUsers(us => us.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage system users and their access roles (Admin only)</p>
      </div>

      <div className="glass-card card-pad">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="loading-spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', fontSize: 12,
                          background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                        }}>{u.username?.[0]?.toUpperCase()}</div>
                        {u.username}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="form-select"
                        value={u.role}
                        onChange={e => handleUpdateRole(u.id, e.target.value)}
                        style={{ width: 120, padding: '4px 8px', fontSize: 12 }}
                      >
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.id, u.username)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
