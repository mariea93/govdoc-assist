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
import { useLanguage } from "@/contexts/language-context";
import type { TranslationKey } from "@/lib/i18n";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard · GovLingua AI" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { t } = useLanguage();

  const stats = [
    { labelKey: "admin.dashboard.totalUsers" as TranslationKey, value: "125", subKey: "admin.dashboard.activeAccounts" as TranslationKey },
    { labelKey: "admin.dashboard.documentsProcessed" as TranslationKey, value: "1,284", subKey: "admin.dashboard.totalDocuments" as TranslationKey },
    { labelKey: "admin.dashboard.summariesGenerated" as TranslationKey, value: "962", subKey: "admin.dashboard.conciseSummaries" as TranslationKey },
    { labelKey: "admin.dashboard.translationsGenerated" as TranslationKey, value: "734", subKey: "admin.dashboard.translatedFiles" as TranslationKey },
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
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("admin.dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("admin.dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground font-medium">{t(s.labelKey)}</p>
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground font-medium">{t(s.subKey)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">{t("admin.dashboard.systemActivity")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("admin.dashboard.systemActivitySub")}</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: t("day.mon"), signups: 2, documents: 12, summaries: 9, translations: 8 },
                  { name: t("day.tue"), signups: 4, documents: 18, summaries: 13, translations: 12 },
                  { name: t("day.wed"), signups: 1, documents: 15, summaries: 20, translations: 22 },
                  { name: t("day.thu"), signups: 5, documents: 24, summaries: 26, translations: 18 },
                  { name: t("day.fri"), signups: 3, documents: 22, summaries: 18, translations: 15 },
                  { name: t("day.sat"), signups: 0, documents: 10, summaries: 8, translations: 5 },
                  { name: t("day.sun"), signups: 1, documents: 7, summaries: 4, translations: 3 },
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
                              <span className="text-muted-foreground font-medium">{p.name}</span>
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
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="signups"
                  name={t("admin.dashboard.totalUsers")}
                  fill="#c9a227"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
                <Bar
                  dataKey="documents"
                  name={t("admin.dashboard.documentsProcessed")}
                  fill="#163a5f"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
                <Bar
                  dataKey="summaries"
                  name={t("admin.dashboard.summariesGenerated")}
                  fill="#2f6b4f"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
                <Bar
                  dataKey="translations"
                  name={t("admin.dashboard.translationsGenerated")}
                  fill="#8b5cf6"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">{t("admin.dashboard.recentLogs")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.dashboard.colDate")}</TableHead>
                  <TableHead>{t("admin.dashboard.colUserTrigger")}</TableHead>
                  <TableHead>{t("admin.dashboard.colActionLogged")}</TableHead>
                  <TableHead>{t("admin.dashboard.colStatus")}</TableHead>
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
              {t("admin.dashboard.viewFullLog")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
