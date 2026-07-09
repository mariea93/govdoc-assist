import type { UserRole } from "@/lib/user-accounts";

/** Route citizens to Results and employees to Review & Validate after processing. */
export function getPostProcessRoute(role: UserRole | null, dbId: string) {
  if (role === "employee") {
    return { to: "/review-validate" as const, search: { doc: dbId } };
  }
  return { to: "/results" as const, search: { doc: dbId } };
}
