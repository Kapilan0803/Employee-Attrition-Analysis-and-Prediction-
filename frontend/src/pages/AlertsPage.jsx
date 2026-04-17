import { useState, useEffect } from 'react';
import { getNotifications, markRead, markAllRead } from '../api';
import toast from 'react-hot-toast';

export default function AlertsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.data || []);
    } catch {
      // Show sample data if no notifications from backend
      setNotifications(getSampleAlerts());
    } finally {
      setLoading(false);
    }
  };

  const getSampleAlerts = () => [
    { id: 1, message: 'High attrition risk detected', employeeId: 'EMP-001', employeeName: 'John Smith', department: 'Sales', severity: 'HIGH', isRead: false, createdAt: new Date().toISOString() },
    { id: 2, message: 'Employee approaching critical tenure threshold', employeeId: 'EMP-042', employeeName: 'Sarah Johnson', department: 'R&D', severity: 'MEDIUM', isRead: false, createdAt: new Date().toISOString() },
    { id: 3, message: 'Low job satisfaction flagged in recent survey', employeeId: 'EMP-088', employeeName: 'Mike Chen', department: 'HR', severity: 'MEDIUM', isRead: true, createdAt: new Date().toISOString() },
  ];

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { }
  };

  const filtered = filter === 'ALL' ? notifications :
    filter === 'UNREAD' ? notifications.filter(n => !n.isRead) :
      notifications.filter(n => n.severity === filter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const RETENTION_TIPS = {
    HIGH: [
      '💰 Offer a 15-20% salary review',
      '🎯 Discuss career growth roadmap',
      '⏰ Reduce overtime load immediately',
      '🏆 Recognition and performance bonus'
    ],
    MEDIUM: [
      '💬 Schedule 1:1 conversation',
      '📚 Provide upskilling opportunities',
      '🏠 Consider flexible work arrangement',
    ],
    LOW: [
      '🌟 Regular appreciation messages',
      '📊 Share team impact metrics'
    ]
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Alerts & Notifications</h1>
          <p className="page-subtitle">High-risk employee detection and retention recommendations</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAll}>✓ Mark All Read</button>
        )}
      </div>

      {/* Summary */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        {[
          { color: 'red',    icon: '🚨', value: notifications.filter(n => n.severity === 'HIGH').length,   label: 'High Risk Alerts' },
          { color: 'amber',  icon: '⚠️', value: notifications.filter(n => n.severity === 'MEDIUM').length, label: 'Medium Risk' },
          { color: 'purple', icon: '🔔', value: unreadCount,          label: 'Unread' },
          { color: 'blue',   icon: '📋', value: notifications.length, label: 'Total Alerts' },
        ].map(({ color, icon, value, label }) => (
          <div key={label} className={`metric-card ${color}`}>
            <div className="metric-top">
              <div className={`metric-icon ${color}`}>{icon}</div>
            </div>
            <div className={`metric-value ${color}`}>{value}</div>
            <div className="metric-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL', 'UNREAD', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
          <button key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="glass-card skeleton" style={{ height: 100 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card card-pad">
          <div className="empty-state">
            <span className="empty-icon">✅</span>
            <div className="empty-title">No Alerts</div>
            <div className="empty-description">No high-risk employees detected in the current dataset.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(n => (
            <div key={n.id} className="glass-card card-pad fade-in" style={{
              borderLeft: `4px solid ${n.severity === 'HIGH' ? '#f87171' : n.severity === 'MEDIUM' ? 'var(--amber)' : '#34d399'}`,
              opacity: n.isRead ? 0.7 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className={`badge ${n.severity === 'HIGH' ? 'badge-high' : n.severity === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                      {n.severity}
                    </span>
                    {!n.isRead && <span className="badge badge-purple">NEW</span>}
                    {n.department && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.department}</span>}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                    {n.employeeName || n.employeeId || 'Unknown Employee'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.message}</div>

                  {/* Retention Tips */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                      💡 RECOMMENDED ACTIONS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(RETENTION_TIPS[n.severity] || RETENTION_TIPS.LOW).map((tip, i) => (
                        <span key={i} style={{
                          fontSize: 12, padding: '4px 10px', borderRadius: 6,
                          background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)'
                        }}>{tip}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  {!n.isRead && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleMarkRead(n.id)}>
                      ✓ Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
