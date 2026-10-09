import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getUnreadCount } from './api';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DataPage from './pages/DataPage';
import EDAPage from './pages/EDAPage';
import MLPage from './pages/MLPage';
import PredictionPage from './pages/PredictionPage';
import ForecastingPage from './pages/ForecastingPage';
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
  const location = useLocation();
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
      {/* Sidebar Navigation */}
      <Sidebar unreadCount={unreadCount} />

      {/* Main Content Area */}
      <main className="main-content">
        <Header currentPath={location.pathname} unreadCount={unreadCount} onMarkAllRead={fetchUnread} />
        <Routes>
          <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/data"         element={<ProtectedRoute roles={['ADMIN','HR']}><DataPage /></ProtectedRoute>} />
          <Route path="/eda"          element={<ProtectedRoute><EDAPage /></ProtectedRoute>} />
          <Route path="/ml"           element={<ProtectedRoute roles={['ADMIN','HR']}><MLPage /></ProtectedRoute>} />
          <Route path="/prediction"   element={<ProtectedRoute roles={['ADMIN','HR']}><PredictionPage /></ProtectedRoute>} />
          <Route path="/forecasting"  element={<ProtectedRoute><ForecastingPage /></ProtectedRoute>} />
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
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
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
