import { useAuth } from '../context/AuthContext';
import { markAllRead } from '../api';
import toast from 'react-hot-toast';

const pageTitles = {
  '/dashboard':    { title: 'Executive HR Dashboard', sub: 'High-level workforce retention and attrition KPIs' },
  '/data':         { title: 'Data Management', sub: 'Ingest, validate, and activate employee datasets' },
  '/eda':          { title: 'Exploratory Data Analysis', sub: 'Statistical distributions, correlations, and demographic insights' },
  '/ml':           { title: 'Machine Learning Studio', sub: 'Train models with SMOTE, benchmark algorithms, and analyze SHAP explainability' },
  '/prediction':   { title: 'Attrition Risk Prediction & What-If Simulator', sub: 'Evaluate individual flight risk, test policy scenarios, and view retention recommendations' },
  '/forecasting':  { title: 'Workforce Forecasting & Cohorts', sub: '12-month Monte Carlo projections and tenure survival curves' },
  '/segmentation': { title: 'Employee Segmentation', sub: 'Unsupervised K-Means clustering for behavioral workforce grouping' },
  '/alerts':       { title: 'Proactive Risk Alerts', sub: 'Automated policy violation and flight-risk detection feed' },
  '/reports':      { title: 'Executive Reporting', sub: 'Generate and download compiled analytics reports in PDF' },
  '/users':        { title: 'User Management & Security', sub: 'Manage role-based access control (RBAC)' },
};

export default function Header({ currentPath = '/', unreadCount = 0, onMarkAllRead }) {
  const { user, theme, toggleTheme } = useAuth();
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
        {/* Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {unreadCount > 0 && (
          <button className="header-btn" onClick={handleMarkAll} title="Mark all read">
            🔔
            <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 700 }}>
              {unreadCount} Alerts
            </span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.username}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--purple-dark)' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
