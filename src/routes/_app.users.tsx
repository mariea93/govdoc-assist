import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Settings as SettingsIcon, Activity } from "lucide-react";
import { users } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "User Management · GovLingua AI" }] }),
  component: UsersPage,
});

const roleColor: Record<string, string> = {
  Admin: "var(--brand-blue)",
  Officer: "var(--brand-green)",
  Translator: "var(--brand-yellow)",
  Viewer: "var(--muted-foreground)",
};

const activity = [
  { user: "Jean Bosco Habimana", action: "Approved 3 new user invitations", time: "10 min ago" },
  { user: "Uwase Mukamana", action: "Processed District_Budget_Q2.docx", time: "32 min ago" },
  { user: "Claude Niyonzima", action: "Translated Citizen_Petition_2026.pdf", time: "1 hr ago" },
  { user: "System", action: "Backup completed successfully", time: "3 hr ago" },
];

function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage staff accounts, roles and permissions.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add user</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>Team members</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: `color-mix(in oklab, ${roleColor[u.role]} 18%, transparent)`, color: roleColor[u.role] }}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{u.office}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === "Active" ? "default" : u.status === "Invited" ? "secondary" : "outline"}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><SettingsIcon className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Activity log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <div><span className="font-medium">{a.user}</span> {a.action}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
