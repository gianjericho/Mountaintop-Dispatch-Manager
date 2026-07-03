import { supabase } from '@/lib/supabase';

export type UserRole = 'tech' | 'admin' | 'developer';

export interface AuthUser {
  email: string;
  role: UserRole;
  team: string | null;
}

export const authService = {
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async verifyUser(email: string): Promise<AuthUser | null> {
    // Cypress test bypass from legacy code
    if (process.env.NODE_ENV !== 'production' && email.includes('cypress')) {
      return {
        email,
        role: email.includes('tech') ? 'tech' : 'developer',
        team: email.includes('tech') ? 'Team Bernie' : null,
      };
    }

    const { data, error } = await supabase
      .from('authorized_emails')
      .select('email, role, team')
      .eq('email', email)
      .single();

    if (error || !data) {
      console.error("Verification Network Error:", error);
      return null;
    }

    return {
      email: data.email,
      role: data.role as UserRole,
      team: data.team,
    };
  }
};
