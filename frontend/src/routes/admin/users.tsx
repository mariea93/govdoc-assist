import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import {
  getRoleLabel,
  userAccounts,
  type UserAccount,
  type UserRole,
} from "@/lib/user-accounts";
import { Plus, Search, UserCog, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "User Management · GovLingua AI" }] }),
  component: AdminUsers,
});

type RoleFilter = "all" | UserRole;

const seedUsers: UserAccount[] = [
  ...userAccounts,
  {
    id: 901,
    name: "Marie Uwimana",
    email: "marie.u@kigali.gov.rw",
    password: "",
    role: "employee",
    office: "Kigali District",
    status: "Invited",
  },
  {
    id: 902,
    name: "Patrick Nkurunziza",
    email: "patrick.n@gov.rw",
    password: "",
    role: "user",
    office: "Public Portal",
    status: "Invited",
  },
];

function AdminUsers() {
  const [users, setUsers] = useState<UserAccount[]>(seedUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

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

  const updateStatus = (id: number, status: UserAccount["status"]) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    toast.success(`Account ${status === "Active" ? "enabled" : status === "Disabled" ? "disabled" : "updated"}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage administrative, employee, and citizen accounts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Users", value: stats.active, sub: "Currently active" },
          { label: "Pending Invitations", value: stats.invited, sub: "Awaiting acceptance" },
          { label: "Disabled Accounts", value: stats.disabled, sub: "Access revoked" },
          { label: "Total Accounts", value: stats.total, sub: "All registered users" },
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
            <CardTitle className="text-base font-bold">User Accounts</CardTitle>
            <Button
              onClick={() => toast.info("Add User form would open here")}
              className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="user">Citizen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Name</TableHead>
                  <TableHead className="min-w-[220px]">Email</TableHead>
                  <TableHead className="w-[120px]">Role</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right min-w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No users match your search or filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold text-sm text-[#163a5f] dark:text-[#3d6a94]">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="text-sm font-medium">{getRoleLabel(user.role)}</TableCell>
                      <TableCell>
                        <AccountStatusBadge status={user.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => toast.message(`Edit ${user.name}`, { description: "User edit dialog would open here." })}
                          >
                            <UserCog className="mr-1 h-3.5 w-3.5" /> Edit
                          </Button>
                          {user.status !== "Active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-[var(--brand-green)]"
                              onClick={() => updateStatus(user.id, "Active")}
                            >
                              <UserPlus className="mr-1 h-3.5 w-3.5" /> Enable
                            </Button>
                          )}
                          {user.status !== "Disabled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-destructive"
                              onClick={() => updateStatus(user.id, "Disabled")}
                            >
                              <UserMinus className="mr-1 h-3.5 w-3.5" /> Disable
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
        </CardContent>
      </Card>
    </div>
  );
}
