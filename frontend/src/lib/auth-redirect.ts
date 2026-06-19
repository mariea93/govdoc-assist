import { canAccessRoute, getDefaultRouteForRole } from "@/lib/permissions";
import type { UserRole } from "@/lib/user-accounts";

export function resolvePostLoginRedirect(role: UserRole, requestedPath?: string): string {
  if (requestedPath && canAccessRoute(role, requestedPath)) {
    return requestedPath;
  }
  return getDefaultRouteForRole(role);
}
