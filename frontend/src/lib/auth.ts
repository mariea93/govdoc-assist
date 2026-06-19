import { findUserByEmail, userAccounts, type UserRole } from "@/lib/user-accounts";

const AUTH_SESSION_KEY = "govlingua-auth-session";
const AUTH_USER_ID_KEY = "govlingua-auth-user-id";
const AUTH_EMAIL_KEY = "govlingua-auth-email";
const AUTH_NAME_KEY = "govlingua-auth-name";
const AUTH_ROLE_KEY = "govlingua-auth-role";
const AUTH_OFFICE_KEY = "govlingua-auth-office";

/** Temporary development mode — set to false when enabling strict credential checks. */
export const USE_RELAXED_AUTH = false;

export type AuthSession = {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
  office: string;
};

function persistSession(session: AuthSession): void {
  localStorage.setItem(AUTH_SESSION_KEY, "true");
  localStorage.setItem(AUTH_USER_ID_KEY, String(session.userId));
  localStorage.setItem(AUTH_EMAIL_KEY, session.email);
  localStorage.setItem(AUTH_NAME_KEY, session.name);
  localStorage.setItem(AUTH_ROLE_KEY, session.role);
  localStorage.setItem(AUTH_OFFICE_KEY, session.office);
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  if (localStorage.getItem(AUTH_SESSION_KEY) !== "true") {
    return null;
  }

  const userId = Number(localStorage.getItem(AUTH_USER_ID_KEY));
  const email = localStorage.getItem(AUTH_EMAIL_KEY);
  const name = localStorage.getItem(AUTH_NAME_KEY);
  const role = localStorage.getItem(AUTH_ROLE_KEY) as UserRole | null;
  const office = localStorage.getItem(AUTH_OFFICE_KEY);

  if (!userId || !email || !name || !role || !office) {
    signOut();
    return null;
  }

  if (role !== "admin" && role !== "user") {
    signOut();
    return null;
  }

  if (USE_RELAXED_AUTH) {
    return { userId, email, name, role, office };
  }

  const account = userAccounts.find((entry) => entry.id === userId);
  if (!account || account.status === "Disabled") {
    signOut();
    return null;
  }

  const session: AuthSession = {
    userId: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    office: account.office,
  };

  persistSession(session);
  return session;
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
  | { success: false; error: "missing_fields" | "invalid_credentials" | "account_disabled" };

export function signIn(email: string, password: string): SignInResult {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { success: false, error: "missing_fields" };
  }

  if (USE_RELAXED_AUTH) {
    const account = findUserByEmail(trimmedEmail);
    const session: AuthSession = account
      ? {
          userId: account.id,
          email: account.email,
          name: account.name,
          role: account.role,
          office: account.office,
        }
      : {
          userId: 0,
          email: trimmedEmail,
          name: trimmedEmail.split("@")[0] || "User",
          role: "user",
          office: "Development",
        };

    persistSession(session);
    return { success: true, session };
  }

  const account = findUserByEmail(trimmedEmail);

  if (!account || account.password !== trimmedPassword) {
    return { success: false, error: "invalid_credentials" };
  }

  if (account.status === "Disabled") {
    return { success: false, error: "account_disabled" };
  }

  const session: AuthSession = {
    userId: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    office: account.office,
  };

  persistSession(session);

  return {
    success: true,
    session,
  };
}

export function signInWithDefaultAccount(): SignInResult {
  return signInWithMockAccount("user");
}

export function signInWithMockAccount(role: UserRole): SignInResult {
  const account =
    userAccounts.find((entry) => entry.status === "Active" && entry.role === role) ??
    userAccounts.find((entry) => entry.status === "Active");

  if (!account) {
    return { success: false, error: "invalid_credentials" };
  }

  const session: AuthSession = {
    userId: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    office: account.office,
  };

  persistSession(session);
  return { success: true, session };
}

export function signOut(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(AUTH_USER_ID_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
  localStorage.removeItem(AUTH_NAME_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  localStorage.removeItem(AUTH_OFFICE_KEY);
}
