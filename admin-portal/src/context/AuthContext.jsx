import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAdmin(JSON.parse(localStorage.getItem('admin') || 'null'));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    localStorage.setItem('adminToken', res.data.token);
    localStorage.setItem('admin', JSON.stringify(res.data.admin));
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setAdmin(res.data.admin);
    return res.data;
  };

  const logout = async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    delete api.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
