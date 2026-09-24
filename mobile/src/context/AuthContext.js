import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/index.js';
import { setToken, setUser, getUser, clearAuth } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getUser();
      if (stored) {
        setUserState(stored);
        try {
          const me = await auth.me();
          if (me && me.id) setUserState(me);
        } catch {
          // token expired or offline; keep cached user
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const res = await auth.login(email, password);
    await setToken(res.token);
    await setUser(res.user);
    setUserState(res.user);
    return res.user;
  };

  const register = async (data) => {
    const res = await auth.register(data);
    await setToken(res.token);
    await setUser(res.user);
    setUserState(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      // ignore network errors on logout
    }
    await clearAuth();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}