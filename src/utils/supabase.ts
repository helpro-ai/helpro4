// Lightweight Supabase stub to avoid build-time dependency issues in this environment.
// Replace with real @supabase/supabase-js client when credentials are configured.

export interface AuthResult {
  user?: { id: string; email?: string };
  error?: { message: string };
}

const warn = (action: string) => {
  if (typeof console !== 'undefined') {
    console.warn(`[supabase] ${action} (stubbed, configure VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)`);
  }
};

export const supabase = {
  auth: {
    signInWithPassword: async (payload: { email: string; password: string }): Promise<AuthResult> => {
      warn('signInWithPassword');
      return { user: { id: 'local-user', email: payload.email } };
    },
    signUp: async (payload: { email: string; password: string }): Promise<AuthResult> => {
      warn('signUp');
      return { user: { id: 'local-user', email: payload.email } };
    },
    signOut: async (): Promise<AuthResult> => {
      warn('signOut');
      return {};
    },
  },
};
