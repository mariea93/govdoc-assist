import { api, getToken, setToken, removeToken } from "@/lib/api-client";
import type { UserRole } from "@/lib/user-accounts";

const SESSION_KEY = "govlingua-session";

export type AuthSession = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  office: string;
};

type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "EMPLOYEE";
  office: string;
  status: string;
  createdAt: string;
};

function mapRole(backendRole: string): UserRole {
  switch (backendRole) {
    case "ADMIN": return "admin";
    case "EMPLOYEE": return "employee";
    default: return "user";
  }
}

function toSession(user: BackendUser): AuthSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: mapRole(user.role),
    office: user.office,
  };
}

function persistSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const token = getToken();
  if (!token) return null;

  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    signOut();
    return null;
  }
}

export function isAuthenticated(): boolean {
  return readSession() !== null;
}

export function getAuthSession(): AuthSession | null {
  return readSession();
}

export function getAuthEmail(): string | null {
  return readSession()?.email ?? null;
}

export function getAuthRole(): UserRole | null {
  return readSession()?.role ?? null;
}

export type SignInResult =
  | { success: true; session: AuthSession }
  | { success: false; error: "missing_fields" | "invalid_credentials" | "account_disabled" | "network_error" };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { success: false, error: "missing_fields" };
  }

  try {
    const data = await api.post<{ user: BackendUser; token: string }>("/auth/login", {
      email: trimmedEmail,
      password: trimmedPassword,
    });

    setToken(data.token);
    const session = toSession(data.user);
    persistSession(session);
    return { success: true, session };
  } catch (err: any) {
    if (err?.status === 403) {
      return { success: false, error: "account_disabled" };
    }
    if (err?.status === 401) {
      return { success: false, error: "invalid_credentials" };
    }
    return { success: false, error: "network_error" };
  }
}

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  office?: string;
}): Promise<SignInResult> {
  try {
    const result = await api.post<{ user: BackendUser; token: string }>("/auth/register", data);
    setToken(result.token);
    const session = toSession(result.user);
    persistSession(session);
    return { success: true, session };
  } catch (err: any) {
    if (err?.status === 409) {
      return { success: false, error: "invalid_credentials" };
    }
    return { success: false, error: "network_error" };
  }
}

export async function refreshSession(): Promise<AuthSession | null> {
  try {
    const user = await api.get<BackendUser>("/auth/me");
    const session = toSession(user);
    persistSession(session);
    return session;
  } catch {
    signOut();
    return null;
  }
}

export function signOut(): void {
  removeToken();
  localStorage.removeItem(SESSION_KEY);
}
