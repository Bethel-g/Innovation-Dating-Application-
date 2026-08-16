import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, adminAPI, adminAuthAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    if (token) {
      authAPI.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    
    if (adminToken) {
      adminAuthAPI.getMe()
        .then((res) => setAdmin(res.data))
        .catch(() => {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const hydrateSession = (tokenValue, userData) => {
    if (tokenValue) localStorage.setItem('token', tokenValue);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData || null);
    return userData;
  };

  const hydrateAdminSession = (tokenValue, adminData) => {
    if (tokenValue) localStorage.setItem('adminToken', tokenValue);
    if (adminData) localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData || null);
    return adminData;
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    hydrateSession(res.data.token, res.data.user);
    return res.data;
  };

  const adminLogin = async (email, password) => {
    const res = await adminAuthAPI.login({ email, password });
    hydrateAdminSession(res.data.token, res.data.admin);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    hydrateSession(res.data.token, res.data.user);
    return res.data;
  };

  const adminLogout = async () => {
    try { await adminAuthAPI.logout(); } catch (e) { /* ignore */ }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      admin, 
      loading, 
      login, 
      register,
      adminLogin,
      logout,
      adminLogout,
      setUser,
      hydrateSession,
      hydrateAdminSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
