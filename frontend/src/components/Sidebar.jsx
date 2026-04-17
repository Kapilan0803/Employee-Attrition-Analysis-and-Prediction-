import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard',    icon: '📊', label: 'Dashboard',      roles: ['ADMIN', 'HR', 'VIEWER'] },
  { path: '/data',         icon: '📁', label: 'Data',            roles: ['ADMIN', 'HR'] },
  { path: '/eda',          icon: '🔍', label: 'Analytics',       roles: ['ADMIN', 'HR', 'VIEWER'] },
  { path: '/ml',           icon: '🤖', label: 'ML Models',       roles: ['ADMIN', 'HR'] },
  { path: '/prediction',   icon: '🎯', label: 'Prediction',      roles: ['ADMIN', 'HR'] },
  { path: '/segmentation', icon: '🧩', label: 'Segmentation',    roles: ['ADMIN', 'HR'] },
  { path: '/alerts',       icon: '🔔', label: 'Alerts',          roles: ['ADMIN', 'HR', 'VIEWER'] },
  { path: '/reports',      icon: '📄', label: 'Reports',         roles: ['ADMIN', 'HR'] },
  { path: '/users',        icon: '👥', label: 'User Management', roles: ['ADMIN'] },
];

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout } = useAuth();
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
        <span className="sidebar-logo-chevron">▾</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main menu</div>

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

      {/* Footer — user card + logout */}
      <div className="sidebar-footer">
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
          style={{ marginTop: 4, color: '#ed7272' }}
        >
          <span className="nav-icon">→</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
