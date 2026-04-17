import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('eaap_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('eaap_token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await apiLogin({ username, password });
      const { token: t, ...userData } = res.data.data;
      localStorage.setItem('eaap_token', t);
      localStorage.setItem('eaap_user', JSON.stringify(userData));
      setToken(t);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('eaap_token');
    localStorage.removeItem('eaap_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isHR = () => user?.role === 'HR' || user?.role === 'ADMIN';
  const isViewer = () => user?.role === 'VIEWER';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isHR, isViewer }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
