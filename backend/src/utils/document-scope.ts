import { Role } from "@prisma/client";

/** Citizens and employees see only their own documents; admins see all. */
export function applyDocumentScope<T extends Record<string, unknown>>(
  where: T,
  userId: string,
  role: Role
): T & { userId?: string } {
  if (role === "ADMIN") return where;
  return { ...where, userId };
}

export function requiresPersonalScope(role: Role): boolean {
  return role === "USER" || role === "EMPLOYEE";
}
