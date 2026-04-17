import { useAuth } from '../context/AuthContext';
import { markAllRead } from '../api';
import toast from 'react-hot-toast';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Key HR metrics and analytics overview' },
  '/data': { title: 'Data Management', sub: 'Upload and manage employee datasets' },
  '/eda': { title: 'Exploratory Data Analysis', sub: 'Statistical insights and visual patterns' },
  '/ml': { title: 'Machine Learning', sub: 'Train and evaluate prediction models' },
  '/prediction': { title: 'Attrition Prediction', sub: 'Predict employee attrition risk' },
  '/segmentation': { title: 'Employee Segmentation', sub: 'K-Means clustering analysis' },
  '/alerts': { title: 'Alerts & Notifications', sub: 'High-risk employee detection' },
  '/reports': { title: 'Report Generation', sub: 'Download PDF analytics reports' },
  '/users': { title: 'User Management', sub: 'Manage access and roles' },
};

export default function Header({ currentPath = '/', unreadCount = 0, onMarkAllRead }) {
  const { user } = useAuth();
  const info = pageTitles[currentPath] || { title: 'EAAP', sub: 'Employee Attrition Analysis & Prediction' };

  const handleMarkAll = async () => {
    try {
      await onMarkAllRead?.();
      toast.success('All notifications marked as read');
    } catch { }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2>{info.title}</h2>
        <p>{info.sub}</p>
      </div>

      <div className="header-right">
        {unreadCount > 0 && (
          <button className="header-btn" onClick={handleMarkAll} title="Mark all read">
            🔔
            <span className="notification-badge" />
            <span style={{ marginLeft: 4, fontSize: 12, color: '#ef4444', fontWeight: 700 }}>
              {unreadCount}
            </span>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.username}</span>
        </div>
      </div>
    </header>
  );
}
