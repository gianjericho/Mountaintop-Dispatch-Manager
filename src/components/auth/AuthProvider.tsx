"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser } from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  actualUser: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setImpersonation: (role: string | null, team: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  actualUser: null,
  loading: true,
  signOut: async () => {},
  setImpersonation: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [actualUser, setActualUser] = useState<AuthUser | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const session = await authService.getSession();
        if (session?.user?.email) {
          const authUser = await authService.verifyUser(session.user.email);
          if (mounted) setActualUser(authUser);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkSession();

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user?.email) {
        const authUser = await authService.verifyUser(session.user.email);
        if (mounted) setActualUser(authUser);
      } else {
        if (mounted) setActualUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setActualUser(null);
    setImpersonatedUser(null);
  };

  const setImpersonation = (role: string | null, team: string | null) => {
    if (!actualUser || actualUser.role !== 'developer') return;
    if (!role) {
      setImpersonatedUser(null);
    } else {
      setImpersonatedUser({
        ...actualUser,
        role: role as 'admin' | 'tech' | 'developer',
        team: team || actualUser.team,
      });
    }
  };

  const user = impersonatedUser || actualUser;

  return (
    <AuthContext.Provider value={{ user, actualUser, loading, signOut, setImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
