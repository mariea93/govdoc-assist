import { useState } from "react";
import { Bell, Search, ChevronDown, Settings, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { translateRole } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { HelpChatbot } from "@/components/HelpChatbot";

export function TopBar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);

  const initials = session?.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??";

  const handleSignOut = () => {
    logout();
    navigate({ to: "/sign-in" });
  };

  const handleSettings = () => {
    if (session?.role === "admin") {
      navigate({ to: "/admin/profile" });
    } else {
      navigate({ to: "/settings", search: { tab: "profile" } });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("topbar.search")} className="pl-9" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSelector triggerClassName="h-9 w-[130px] gap-2 sm:w-[150px]" />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]" variant="destructive">
              3
            </Badge>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-xs font-semibold leading-tight">{session?.name ?? "User"}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    {session ? translateRole(session.role, t) : "—"}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-0">
              <div className="flex flex-col items-center px-4 pb-4 pt-5 text-center">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-[#163a5f] text-base font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-3 text-sm font-bold text-foreground">{session?.name ?? "User"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {session ? translateRole(session.role, t) : "—"}
                </p>
                <p className="mt-0.5 text-xs text-[#1a73e8]">{session?.email ?? ""}</p>
              </div>
              <DropdownMenuSeparator className="mx-0" />
              <div className="py-1">
                <DropdownMenuItem onClick={handleSettings} className="cursor-pointer px-4 py-2.5">
                  <Settings className="mr-3 h-4 w-4" />
                  {t("topbar.settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHelpOpen(true)} className="cursor-pointer px-4 py-2.5">
                  <HelpCircle className="mr-3 h-4 w-4" />
                  {t("topbar.help")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer px-4 py-2.5 text-destructive focus:text-destructive [&_svg]:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  {t("topbar.signOut")}
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <HelpChatbot open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
