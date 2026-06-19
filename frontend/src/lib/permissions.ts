import type { UserRole } from "@/lib/user-accounts";

export const USER_ROUTES = [
  "/dashboard",
  "/upload",
  "/summarize",
  "/translate",
  "/results",
  "/review-validate",
  "/history",
  "/settings",
] as const;

export const ADMIN_ROUTES = [
  "/admin/dashboard",
  "/admin/users",
  "/admin/system-settings",
  "/admin/reports",
  "/admin/profile",
] as const;

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function canAccessRoute(role: UserRole | null, pathname: string): boolean {
  if (!role) return false;

  if (isAdminRoute(pathname)) {
    return role === "admin" && (ADMIN_ROUTES as readonly string[]).includes(pathname);
  }

  if (pathname === "/review-validate" && role !== "employee") {
    return false;
  }
  if (pathname === "/results" && role !== "user") {
    return false;
  }

  return (role === "user" || role === "employee") && (USER_ROUTES as readonly string[]).includes(pathname);
}

export function getDefaultRouteForRole(role: UserRole): string {
  return role === "admin" ? "/admin/dashboard" : "/dashboard";
}

export function getAccessibleRoutes(role: UserRole): string[] {
  if (role === "admin") {
    return [...ADMIN_ROUTES];
  }
  if (role === "employee") {
    return USER_ROUTES.filter((r) => r !== "/results");
  }
  return USER_ROUTES.filter((r) => r !== "/review-validate");
}
