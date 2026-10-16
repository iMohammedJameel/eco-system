import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authService.isAuthenticated());
  const [profile, setProfile] = useState(authService.getProfile());

  const login = useCallback(async (email, password, remember = false) => {
    const { token: t, profile: p } = await authService.login(email, password, remember);
    setToken(t);
    setProfile(p);
    return { token: t, profile: p };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      profile,
      isAuthenticated: !!token,
      role: profile?.role || null,
      login,
      logout,
    }),
    [token, profile, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
