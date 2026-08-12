import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSession, logout as logoutRequest, type SessionUser } from './auth';

type AuthState = { user: SessionUser | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => { try { const session = await getSession(); setUser(session?.technician ?? null); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); const expired = () => { setUser(null); }; window.addEventListener('cranehub:session-expired', expired); return () => window.removeEventListener('cranehub:session-expired', expired); }, []);
  const logout = async () => { try { await logoutRequest(); } finally { setUser(null); } };
  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthState { const state = useContext(AuthContext); if (!state) throw new Error('useAuth must be used inside AuthProvider'); return state; }
