export type UserRole = "admin" | "user" | "employee";

export type UserAccount = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  office: string;
  status: "Active" | "Invited" | "Disabled";
};

// Seed custom users storage to support registration in memory/localStorage
const CUSTOM_USERS_KEY = "govlingua-custom-users";

export function getCustomUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(CUSTOM_USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveCustomUser(user: Omit<UserAccount, "id">): UserAccount {
  const customUsers = getCustomUsers();
  const nextId = 100 + customUsers.length;
  const newUser: UserAccount = { ...user, id: nextId };
  customUsers.push(newUser);
  localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));
  return newUser;
}

export const userAccounts: UserAccount[] = [
  {
    id: 1,
    name: "Citizen",
    email: "citizen@test.com",
    password: "Password123",
    role: "user",
    office: "Public",
    status: "Active",
  },
  {
    id: 2,
    name: "Employee",
    email: "employee@minaloc.gov.rw",
    password: "Password123",
    role: "employee",
    office: "MINALOC HQ",
    status: "Active",
  },
  {
    id: 3,
    name: "Admin",
    email: "admin@govlingua.gov.rw",
    password: "Password123",
    role: "admin",
    office: "GovLingua HQ",
    status: "Active",
  },
  {
    id: 4,
    name: "Jean Bosco Habimana",
    email: "admin@gov.rw",
    password: "admin123",
    role: "admin",
    office: "MINALOC HQ",
    status: "Active",
  },
  {
    id: 5,
    name: "Uwase Mukamana",
    email: "uwase.m@kigali.gov.rw",
    password: "user123",
    role: "user",
    office: "Kigali District",
    status: "Active",
  },
  {
    id: 6,
    name: "Claude Niyonzima",
    email: "claude.n@gov.rw",
    password: "user123",
    role: "user",
    office: "Musanze District",
    status: "Active",
  },
  {
    id: 7,
    name: "Aline Ingabire",
    email: "user@gov.rw",
    password: "user123",
    role: "user",
    office: "Huye Sector",
    status: "Active",
  },
  {
    id: 8,
    name: "Eric Mugisha",
    email: "eric.m@gov.rw",
    password: "user123",
    role: "user",
    office: "Rubavu District",
    status: "Disabled",
  },
];

export function findUserByEmail(email: string): UserAccount | undefined {
  const normalized = email.trim().toLowerCase();
  const staticUser = userAccounts.find((account) => account.email.toLowerCase() === normalized);
  if (staticUser) return staticUser;
  return getCustomUsers().find((account) => account.email.toLowerCase() === normalized);
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    user: "Citizen",
    employee: "Employee",
  };
  return labels[role];
}
