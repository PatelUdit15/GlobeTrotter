import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, saveTokens, clearTokens, saveUser, loadUser, getAccessToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(loadUser);
  const [loading, setLoading] = useState(true);   // initial token-check in progress

  // On mount, if we have a stored token, verify it and load fresh user data
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(u => { setUser(u); saveUser(u); })
      .catch((err) => {
        // 401 = token expired and refresh failed — just clear and go to login
        if (err?.status === 401 || err?.status === 403) {
          clearTokens();
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    saveTokens(data);
    saveUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (formData) => {
    const data = await authApi.signup(formData);
    saveTokens(data);
    // Fetch full profile after signup
    const me = await authApi.me();
    saveUser(me);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.me();
    saveUser(me);
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
