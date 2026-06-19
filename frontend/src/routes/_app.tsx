import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { isAuthenticated, getAuthRole } from "@/lib/auth";
import { canAccessRoute, getDefaultRouteForRole } from "@/lib/permissions";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    // Keep all dashboard routes publicly accessible during development (no authentication restrictions yet)
    /*
    if (!isAuthenticated()) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.pathname },
      });
    }

    const role = getAuthRole();

    if (role === "admin") {
      throw redirect({ to: getDefaultRouteForRole("admin") });
    }

    if (!canAccessRoute(role, location.pathname)) {
      throw redirect({ to: getDefaultRouteForRole(role ?? "user") });
    }
    */
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-muted/30">
        <AppSidebar />
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
