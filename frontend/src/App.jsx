import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getUnreadCount, markAllRead } from './api';

import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DataPage from './pages/DataPage';
import EDAPage from './pages/EDAPage';
import MLPage from './pages/MLPage';
import PredictionPage from './pages/PredictionPage';
import SegmentationPage from './pages/SegmentationPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnread = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.data?.count || 0);
    } catch { }
  };

  if (!user) return null;

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <Sidebar unreadCount={unreadCount} />

      {/* Full-width main content */}
      <main className="main-content">
        <Routes>
          <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/data"         element={<ProtectedRoute roles={['ADMIN','HR']}><DataPage /></ProtectedRoute>} />
          <Route path="/eda"          element={<ProtectedRoute><EDAPage /></ProtectedRoute>} />
          <Route path="/ml"           element={<ProtectedRoute roles={['ADMIN','HR']}><MLPage /></ProtectedRoute>} />
          <Route path="/prediction"   element={<ProtectedRoute roles={['ADMIN','HR']}><PredictionPage /></ProtectedRoute>} />
          <Route path="/segmentation" element={<ProtectedRoute roles={['ADMIN','HR']}><SegmentationPage /></ProtectedRoute>} />
          <Route path="/alerts"       element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/reports"      element={<ProtectedRoute roles={['ADMIN','HR']}><ReportsPage /></ProtectedRoute>} />
          <Route path="/users"        element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
          <Route path="*"             element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#13131a',
              color: '#f8fafc',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '10px',
              fontSize: '13px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/*"     element={<ProtectedApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function LoginRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

function ProtectedApp() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default App;
