import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSession, login as svcLogin, signup as svcSignup, logout as svcLogout, getMe } from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const session = getSession();
    if (session?.user) {
      setUser(session.user);
      // Verify token is still valid with the server
      getMe()
        .then(fresh => { if (fresh) setUser(fresh); else setUser(null); })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Handle 401 events from the API layer
    const onExpired = () => setUser(null);
    window.addEventListener('evoke:session-expired', onExpired);
    return () => window.removeEventListener('evoke:session-expired', onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u } = await svcLogin(email, password);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (payload) => {
    const { user: u } = await svcSignup(payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await svcLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
