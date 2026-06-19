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
  signInWithDefaultAccount,
  signInWithMockAccount,
  signOut as authSignOut,
  type AuthSession,
  type SignInResult,
} from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";
import type { UserRole } from "@/lib/user-accounts";

type AuthContextValue = {
  session: AuthSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => SignInResult;
  enterWorkspace: () => SignInResult;
  enterWorkspaceAs: (role: UserRole) => SignInResult;
  logout: () => void;
  canAccess: (pathname: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getAuthSession());
    setIsReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const result = authSignIn(email, password);
    if (result.success) {
      setSession(result.session);
    }
    return result;
  }, []);

  const enterWorkspace = useCallback(() => {
    const result = signInWithDefaultAccount();
    if (result.success) {
      setSession(result.session);
    }
    return result;
  }, []);

  const enterWorkspaceAs = useCallback((role: UserRole) => {
    const result = signInWithMockAccount(role);
    if (result.success) {
      setSession(result.session);
    }
    return result;
  }, []);

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
      enterWorkspace,
      enterWorkspaceAs,
      logout,
      canAccess: (pathname: string) => canAccessRoute(role, pathname),
    }),
    [session, role, isReady, login, enterWorkspace, enterWorkspaceAs, logout],
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
