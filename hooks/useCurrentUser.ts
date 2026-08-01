'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { UserContext } from '../lib/domain/rbac';
import { UserRole } from '../lib/supabase/types';

export function useCurrentUser() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [impersonatedTeam, setImpersonatedTeam] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function getUserSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          setUser(null);
          setLoading(false);
          return;
        }

        const email = session.user.email;

        // Query authorized_emails
        const { data: authData } = await supabase
          .from('authorized_emails')
          .select('role, team')
          .eq('email', email)
          .single();

        const roleData = authData as { role: UserRole; team: string | null } | null;
        const role: UserRole = roleData?.role || 'tech';
        const team: string | null = roleData?.team || null;

        setUser({
          email,
          role,
          team
        });
      } catch (err) {
        console.error('Error fetching user context:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUserSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const activeUser: UserContext | null = user ? {
    email: user.email,
    role: impersonatedRole || user.role,
    team: impersonatedRole === 'tech' ? (impersonatedTeam || user.team) : (impersonatedTeam || user.team),
    isImpersonating: !!impersonatedRole || !!impersonatedTeam
  } : null;

  return {
    user: activeUser,
    realUser: user,
    loading,
    setImpersonation: (role: UserRole | null, team: string | null) => {
      setImpersonatedRole(role);
      setImpersonatedTeam(team);
    }
  };
}
