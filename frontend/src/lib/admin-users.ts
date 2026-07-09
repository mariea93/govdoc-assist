import type { UserAccount, UserRole } from "@/lib/user-accounts";

export type ApiAdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "EMPLOYEE";
  office: string;
  status: "ACTIVE" | "INVITED" | "DISABLED";
  createdAt?: string;
};

export type AdminUserRow = Omit<UserAccount, "id" | "password"> & { id: string };

export function mapApiRole(role: ApiAdminUser["role"]): UserRole {
  if (role === "ADMIN") return "admin";
  if (role === "EMPLOYEE") return "employee";
  return "user";
}

export function mapApiStatus(status: ApiAdminUser["status"]): UserAccount["status"] {
  if (status === "INVITED") return "Invited";
  if (status === "DISABLED") return "Disabled";
  return "Active";
}

export function mapApiUser(user: ApiAdminUser): AdminUserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapApiRole(user.role),
    office: user.office,
    status: mapApiStatus(user.status),
  };
}

export function toApiStatus(status: UserAccount["status"]): ApiAdminUser["status"] {
  if (status === "Invited") return "INVITED";
  if (status === "Disabled") return "DISABLED";
  return "ACTIVE";
}

export function toApiRoleFilter(role: UserRole): string {
  return role.toUpperCase();
}
