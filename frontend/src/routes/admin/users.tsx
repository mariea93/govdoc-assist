import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountStatusBadge } from "@/components/AccountStatusBadge";
import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog";
import { getRoleLabel, type UserAccount, type UserRole } from "@/lib/user-accounts";
import {
  mapApiUser,
  toApiStatus,
  type AdminUserRow,
  type ApiAdminUser,
} from "@/lib/admin-users";
import { api } from "@/lib/api-client";
import { Plus, Search, UserCog, UserMinus, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "User Management · GovLingua AI" }] }),
  component: AdminUsers,
});

type RoleFilter = "all" | UserRole;

function AdminUsers() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [addUserOpen, setAddUserOpen] = useState(false);

  const getRoleTranslation = (r: string) => {
    const normalized = r.toLowerCase();
    if (normalized === "admin") return t("role.admin");
    if (normalized === "employee") return t("role.employee");
    if (normalized === "user" || normalized === "citizen") return t("role.citizen");
    return r;
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ users: ApiAdminUser[] }>("/admin/users?limit=100");
      setUsers(data.users.map(mapApiUser));
    } catch {
      toast.error(t("admin.users.failedLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const stats = useMemo(() => ({
    active: users.filter((u) => u.status === "Active").length,
    invited: users.filter((u) => u.status === "Invited").length,
    disabled: users.filter((u) => u.status === "Disabled").length,
    total: users.length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const updateStatus = async (id: string, status: UserAccount["status"]) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status: toApiStatus(status) });
      toast.success(status === "Active" ? t("admin.users.enabledToast") : status === "Disabled" ? t("admin.users.disabledToast") : t("admin.users.updatedToast"));
      await loadUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("admin.users.failedStatus"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("admin.users.title")}</h1>
        <p className="text-muted-foreground">
          {t("admin.users.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("admin.users.activeUsers"), value: stats.active, sub: t("admin.users.stats.activeSub") },
          { label: t("admin.users.pendingInvites"), value: stats.invited, sub: t("admin.users.stats.invitedSub") },
          { label: t("admin.users.disabledAccounts"), value: stats.disabled, sub: t("admin.users.stats.disabledSub") },
          { label: t("admin.users.totalUsers"), value: stats.total, sub: t("admin.users.stats.totalSub") },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-bold">{t("admin.users.userAccounts")}</CardTitle>
            <Button
              onClick={() => setAddUserOpen(true)}
              className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold shadow-md animate-fade-in cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" /> {t("admin.users.addUser")}
            </Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.users.searchPlaceholder")}
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("admin.users.colRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.users.allRoles")}</SelectItem>
                <SelectItem value="admin">{t("role.admin")}</SelectItem>
                <SelectItem value="employee">{t("role.employee")}</SelectItem>
                <SelectItem value="user">{t("role.citizen")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">{t("admin.users.colName")}</TableHead>
                    <TableHead className="min-w-[220px]">{t("admin.users.colEmail")}</TableHead>
                    <TableHead className="w-[120px]">{t("admin.users.colRole")}</TableHead>
                    <TableHead className="w-[120px]">{t("admin.users.colStatus")}</TableHead>
                    <TableHead className="text-right min-w-[220px]">{t("admin.users.colActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        {t("admin.users.noUsers")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-semibold text-sm text-[#163a5f] dark:text-[#3d6a94]">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="text-sm font-medium">{getRoleTranslation(user.role)}</TableCell>
                        <TableCell>
                          <AccountStatusBadge status={user.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => toast.message(`${t("admin.users.edit")} ${user.name}`, { description: t("admin.users.editMock") })}
                            >
                              <UserCog className="mr-1 h-3.5 w-3.5" /> {t("admin.users.edit")}
                            </Button>
                            {user.status !== "Active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-[var(--brand-green)]"
                                onClick={() => updateStatus(user.id, "Active")}
                              >
                                <UserPlus className="mr-1 h-3.5 w-3.5" /> {t("admin.users.enable")}
                              </Button>
                            )}
                            {user.status !== "Disabled" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-destructive"
                                onClick={() => updateStatus(user.id, "Disabled")}
                              >
                                <UserMinus className="mr-1 h-3.5 w-3.5" /> {t("admin.users.disable")}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEmployeeDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onCreated={loadUsers}
      />
    </div>
  );
}
