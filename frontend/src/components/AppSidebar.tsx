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
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import type { TranslationKey } from "@/lib/i18n";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLanguage();
  const { role } = useAuth();
  const isActive = (p: string) => pathname === p;

  if (role !== "user" && role !== "employee") {
    return null;
  }

  const visibleMainItems = [
    { titleKey: "sidebar.dashboard" as TranslationKey, url: "/dashboard" },
    { titleKey: "sidebar.upload" as TranslationKey, url: "/upload" },
    { titleKey: "sidebar.summarize" as TranslationKey, url: "/summarize" },
    { titleKey: "sidebar.translate" as TranslationKey, url: "/translate" },
    ...(role === "employee"
      ? [{ titleKey: "sidebar.reviewValidate" as TranslationKey, url: "/review-validate" }]
      : [{ titleKey: "sidebar.results" as TranslationKey, url: "/results" }]),
    { titleKey: "sidebar.history" as TranslationKey, url: "/history" },
    { titleKey: "sidebar.settings" as TranslationKey, url: "/settings" },
  ];

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-group-label opacity-100">{t("sidebar.workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainItems.map((item) => (
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
        <div className="px-2 py-2 text-xs text-sidebar-foreground/60">
          © 2026 GovLingua AI
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
