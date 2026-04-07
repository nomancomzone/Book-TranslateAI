import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: () => {},
  loginWithFacebook: () => {},
  loginWithEmail: async () => false,
  signupWithEmail: async () => false,
  changePassword: async () => false,
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const { getUser, handleAuthCallback, onAuthChange, AUTH_EVENTS } = await import('@netlify/identity');
        const callbackResult = await handleAuthCallback();

        if (callbackResult && callbackResult.type === 'recovery' && callbackResult.user) {
          const u = callbackResult.user;
          setUser({
            id: u.id,
            email: u.email || '',
            name: (u as any).user_metadata?.full_name || u.email || '',
            token: (u as any).token?.access_token || '',
            avatar: (u as any).user_metadata?.avatar_url,
          });
          window.history.replaceState({}, '', window.location.pathname);
          window.location.href = '/account?tab=password';
          return;
        } else if (callbackResult && callbackResult.type === 'oauth' && callbackResult.user) {
          const u = callbackResult.user;
          setUser({
            id: u.id,
            email: u.email || '',
            name: (u as any).user_metadata?.full_name || u.email || '',
            token: (u as any).token?.access_token || '',
            avatar: (u as any).user_metadata?.avatar_url,
          });
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          const currentUser = await getUser();
          if (currentUser) {
            setUser({
              id: currentUser.id,
              email: currentUser.email || '',
              name: (currentUser as any).user_metadata?.full_name || currentUser.email || '',
              token: (currentUser as any).token?.access_token || '',
              avatar: (currentUser as any).user_metadata?.avatar_url,
            });
          }
        }

        onAuthChange((event, u) => {
          if (event === AUTH_EVENTS.LOGIN && u) {
            setUser({
              id: u.id,
              email: u.email || '',
              name: (u as any).user_metadata?.full_name || u.email || '',
              token: (u as any).token?.access_token || '',
              avatar: (u as any).user_metadata?.avatar_url,
            });
          } else if (event === AUTH_EVENTS.LOGOUT) {
            setUser(null);
          }
        });
      } catch (e) {
        console.error('Auth init error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { oauthLogin } = await import('@netlify/identity');
      oauthLogin('google');
    } catch (e) {
      console.error('Google login error:', e);
    }
  }, []);

  const loginWithFacebook = useCallback(async () => {
    try {
      const { oauthLogin } = await import('@netlify/identity');
      oauthLogin('github');
    } catch (e) {
      console.error('Facebook login error:', e);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { login } = await import('@netlify/identity');
      const u = await login(email, password);
      if (u) {
        setUser({
          id: u.id,
          email: u.email || '',
          name: (u as any).user_metadata?.full_name || u.email || '',
          token: (u as any).token?.access_token || '',
          avatar: (u as any).user_metadata?.avatar_url,
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Email login error:', e);
      return false;
    }
  }, []);

  const signupWithEmail = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { signup } = await import('@netlify/identity');
      const u = await signup(email, password, { full_name: name });
      if (u) {
        setUser({
          id: u.id,
          email: u.email || '',
          name: name,
          token: (u as any).token?.access_token || '',
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Signup error:', e);
      return false;
    }
  }, []);

  const changePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    try {
      const { updateUser } = await import('@netlify/identity');
      await updateUser({ password: newPassword });
      return true;
    } catch (e) {
      console.error('Change password error:', e);
      return false;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const { logout } = await import('@netlify/identity');
      await logout();
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      loginWithGoogle,
      loginWithFacebook,
      loginWithEmail,
      signupWithEmail,
      changePassword,
      logout: handleLogout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}