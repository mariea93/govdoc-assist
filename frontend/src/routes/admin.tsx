import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { TopBar } from "@/components/TopBar";
import { isAuthenticated, getAuthRole } from "@/lib/auth";
import { canAccessRoute, getDefaultRouteForRole } from "@/lib/permissions";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      throw redirect({ to: "/admin/dashboard" });
    }

    // Keep all dashboard routes publicly accessible during development (no authentication restrictions yet)
    /*
    if (!isAuthenticated()) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.pathname },
      });
    }

    const role = getAuthRole();
    if (role !== "admin") {
      throw redirect({ to: getDefaultRouteForRole("user") });
    }

    if (!canAccessRoute(role, location.pathname)) {
      throw redirect({ to: getDefaultRouteForRole(role) });
    }
    */
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-muted/30">
        <AdminSidebar />
        <SidebarInset className="flex w-full flex-1 flex-col overflow-y-auto">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
