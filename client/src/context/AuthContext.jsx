import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
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
  }, []);

  const hydrateSession = (tokenValue, userData) => {
    if (tokenValue) localStorage.setItem('token', tokenValue);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData || null);
    return userData;
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    hydrateSession(res.data.token, res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    hydrateSession(res.data.token, res.data.user);
    return res.data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, hydrateSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
