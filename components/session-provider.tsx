'use client';

import * as React from 'react';
import type { Role, User } from '@/lib/types';
import { DEMO_USERS, roleLabel } from '@/lib/permissions';

interface SessionState {
  user: User | null;
  viewAsRole: Role | null;
  effectiveUser: User | null;
  hydrated: boolean;
  login: (role: Role) => void;
  logout: () => void;
  setViewAs: (role: Role | null) => void;
  switchCompany: (companyId: string) => void;
  switchDepot: (depotId: string | undefined) => void;
}

const SessionContext = React.createContext<SessionState | null>(null);

const STORAGE_KEY = 'dec-session';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [viewAsRole, setViewAsRole] = React.useState<Role | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user ?? null);
        setViewAsRole(parsed.viewAsRole ?? null);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, viewAsRole }));
    } catch { /* ignore */ }
  }, [user, viewAsRole, hydrated]);

  const effectiveUser = React.useMemo(() => {
    if (!user) return null;
    if (viewAsRole && viewAsRole !== user.role) {
      return { ...DEMO_USERS[viewAsRole], companyId: user.companyId, depotId: user.depotId };
    }
    return user;
  }, [user, viewAsRole]);

  const login = React.useCallback((role: Role) => {
    setUser(DEMO_USERS[role]);
    setViewAsRole(null);
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    setViewAsRole(null);
  }, []);

  const setViewAs = React.useCallback((role: Role | null) => {
    setViewAsRole(role);
  }, []);

  const switchCompany = React.useCallback((companyId: string) => {
    setUser(prev => prev ? { ...prev, companyId, depotId: undefined } : prev);
  }, []);

  const switchDepot = React.useCallback((depotId: string | undefined) => {
    setUser(prev => prev ? { ...prev, depotId } : prev);
  }, []);

  return (
    <SessionContext.Provider value={{ user, viewAsRole, effectiveUser, hydrated, login, logout, setViewAs, switchCompany, switchDepot }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
