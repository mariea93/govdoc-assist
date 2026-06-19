import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard · GovLingua AI" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "125", sub: "Active accounts" },
    { label: "Documents Processed", value: "1,284", sub: "Total documents" },
    { label: "Summaries Generated", value: "962", sub: "Concise summaries" },
    { label: "Translations Generated", value: "734", sub: "Translated files" },
  ];

  const recentLogs = [
    { date: "15 Jun 2026 11:20", user: "Jean Bosco Habimana", action: "Created user account: Eric Mugisha", status: "Approved" as const },
    { date: "15 Jun 2026 10:45", user: "System Auto-Task", action: "Database backup completed", status: "Completed" as const },
    { date: "15 Jun 2026 09:12", user: "Employee", action: "Validated document: District_Development_Report.pdf", status: "Approved" as const },
    { date: "14 Jun 2026 16:30", user: "Citizen", action: "Uploaded file: land_policy_brief.docx", status: "Completed" as const },
    { date: "14 Jun 2026 15:15", user: "System Auto-Task", action: "Purged temporary session caches", status: "Completed" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of system status, user accounts, and document processing.</p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground font-medium">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">System Activity</CardTitle>
          <p className="text-xs text-muted-foreground">Daily counts of system transactions this week</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Mon", signups: 2, documents: 12, summaries: 9, translations: 8 },
                  { name: "Tue", signups: 4, documents: 18, summaries: 13, translations: 12 },
                  { name: "Wed", signups: 1, documents: 15, summaries: 20, translations: 22 },
                  { name: "Thu", signups: 5, documents: 24, summaries: 26, translations: 18 },
                  { name: "Fri", signups: 3, documents: 22, summaries: 18, translations: 15 },
                  { name: "Sat", signups: 0, documents: 10, summaries: 8, translations: 5 },
                  { name: "Sun", signups: 1, documents: 7, summaries: 4, translations: 3 },
                ]}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  className="text-muted-foreground text-[10px]"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground text-[10px]"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.02)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md space-y-1.5 text-xs">
                          <p className="font-semibold text-foreground">{label}</p>
                          {payload.map((p) => (
                            <div key={p.name} className="flex items-center gap-3">
                              <span
                                className="h-2.5 w-2.5 rounded-sm"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-muted-foreground font-medium">{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</span>
                              <span className="font-bold ml-auto text-foreground">{p.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="rect"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-[11px] font-medium text-muted-foreground mr-3">
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  )}
                />
                <Bar
                  dataKey="signups"
                  name="user signups"
                  fill="#c9a227"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
                <Bar
                  dataKey="documents"
                  name="documents"
                  fill="#163a5f"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
                <Bar
                  dataKey="summaries"
                  name="summaries"
                  fill="#2f6b4f"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
                <Bar
                  dataKey="translations"
                  name="translations"
                  fill="#8b5cf6"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent System Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Recent System Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User / Trigger</TableHead>
                  <TableHead>Action Logged</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm text-muted-foreground font-medium">{row.date}</TableCell>
                    <TableCell className="font-semibold text-sm text-[#163a5f] hover:underline cursor-pointer dark:text-[#3d6a94]">{row.user}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium">{row.action}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={() => toast.info("Full activity log export simulation")}
              className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-full px-6 py-2.5 shadow-md cursor-pointer transition"
            >
              View Full Activity Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
