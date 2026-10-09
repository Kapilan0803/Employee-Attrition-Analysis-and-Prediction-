import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard',    icon: '📊', label: 'Dashboard',       roles: ['ADMIN', 'HR', 'VIEWER'] },
  { path: '/data',         icon: '📁', label: 'Data',             roles: ['ADMIN', 'HR'] },
  { path: '/eda',          icon: '🔍', label: 'Analytics',        roles: ['ADMIN', 'HR', 'VIEWER'] },
  { path: '/ml',           icon: '🤖', label: 'ML Studio',        roles: ['ADMIN', 'HR'] },
  { path: '/prediction',   icon: '🎯', label: 'Prediction',       roles: ['ADMIN', 'HR'] },
  { path: '/forecasting',  icon: '📈', label: 'Forecasting',      roles: ['ADMIN', 'HR', 'VIEWER'] },
  { path: '/segmentation', icon: '🧩', label: 'Segmentation',     roles: ['ADMIN', 'HR'] },
  { path: '/alerts',       icon: '🔔', label: 'Risk Alerts',      roles: ['ADMIN', 'HR', 'VIEWER'] },
  { path: '/reports',      icon: '📄', label: 'Reports',          roles: ['ADMIN', 'HR'] },
  { path: '/users',        icon: '👥', label: 'User Management',  roles: ['ADMIN'] },
];

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo / Workspace */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <span className="sidebar-logo-text">EAAP</span>
        <span className="sidebar-logo-badge">PRO</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Navigation</div>

        {filteredNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/alerts' && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer — Theme toggle + user card + logout */}
      <div className="sidebar-footer">
        <button
          className="nav-item"
          onClick={toggleTheme}
          style={{
            marginBottom: 8,
            background: 'var(--bg-overlay)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--r-md)',
            justifyContent: 'flex-start',
            padding: '7px 10px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}
          title="Toggle Light / Dark theme"
        >
          <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
        </button>

        <div className="user-card">
          <div className="user-avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="user-name">{user?.username}</span>
          <span className={`user-role ${user?.role}`}>{user?.role}</span>
        </div>

        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ marginTop: 2, color: '#dc2626' }}
        >
          <span className="nav-icon">→</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
