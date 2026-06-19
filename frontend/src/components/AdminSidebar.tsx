import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import type { TranslationKey } from "@/lib/i18n";

const adminNavItems: { titleKey: TranslationKey; url: string }[] = [
  { titleKey: "sidebar.dashboard", url: "/admin/dashboard" },
  { titleKey: "admin.userManagement", url: "/admin/users" },
  { titleKey: "admin.systemSettings", url: "/admin/system-settings" },
  { titleKey: "admin.reports", url: "/admin/reports" },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useAuth();
  const { t } = useLanguage();
  const isActive = (path: string) => pathname === path;

  if (role !== "admin") {
    return null;
  }

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-group-label opacity-100">{t("sidebar.administration")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={t(item.titleKey)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-xs text-sidebar-foreground/60">© 2026 GovLingua AI</div>
      </SidebarFooter>
    </Sidebar>
  );
}
