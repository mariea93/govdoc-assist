import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAuthSession,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  refreshSession,
  type AuthSession,
  type SignInResult,
} from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";
import type { UserRole } from "@/lib/user-accounts";
import { useLanguage } from "@/contexts/language-context";
import { api } from "@/lib/api-client";
import { isPlatformLanguage } from "@/lib/i18n";

type AuthContextValue = {
  session: AuthSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<SignInResult>;
  register: (data: { name: string; email: string; password: string; office?: string }) => Promise<SignInResult>;
  logout: () => void;
  canAccess: (pathname: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { setLanguage } = useLanguage();

  const syncLanguageFromBackend = useCallback(async () => {
    try {
      const prefs = await api.get<{ interfaceLanguage?: string }>("/users/me/preferences");
      if (prefs.interfaceLanguage && isPlatformLanguage(prefs.interfaceLanguage)) {
        setLanguage(prefs.interfaceLanguage);
      }
    } catch {
      // Ignore — keep whatever language is in localStorage
    }
  }, [setLanguage]);

  useEffect(() => {
    const stored = getAuthSession();
    if (stored) {
      setSession(stored);
      refreshSession().then((fresh) => {
        if (fresh) setSession(fresh);
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    if (result.success) {
      setSession(result.session);
      syncLanguageFromBackend();
    }
    return result;
  }, [syncLanguageFromBackend]);

  const register = useCallback(async (data: { name: string; email: string; password: string; office?: string }) => {
    const result = await authSignUp(data);
    if (result.success) {
      setSession(result.session);
      syncLanguageFromBackend();
    }
    return result;
  }, [syncLanguageFromBackend]);

  const logout = useCallback(() => {
    authSignOut();
    setSession(null);
  }, []);

  const role = session?.role ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      role,
      isAuthenticated: session !== null,
      isReady,
      login,
      register,
      logout,
      canAccess: (pathname: string) => canAccessRoute(role, pathname),
    }),
    [session, role, isReady, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
