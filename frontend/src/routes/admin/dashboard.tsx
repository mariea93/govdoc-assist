import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { api } from "@/lib/api-client";
import { Loader2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard · GovLingua AI" }] }),
  component: AdminDashboard,
});

type SummaryData = {
  totalUsers: number;
  totalDocuments: number;
  completedDocuments: number;
  summariesGenerated: number;
  translationsGenerated: number;
  successRate: number;
  documentsLast30Days: number;
};

type WeeklyData = {
  name: string;
  signups: number;
  documents: number;
  summaries: number;
  translations: number;
}[];

type LogUser = {
  name: string;
  email: string;
  role: string;
};

type LogItem = {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  createdAt: string;
  user?: LogUser;
  comment?: string;
};

function formatLogDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

function getStatusForAction(action: string) {
  if (action === "VALIDATION") return "Approved" as const;
  return "Completed" as const;
}

function AdminDashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [weekly, setWeekly] = useState<WeeklyData>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [fullLogsOpen, setFullLogsOpen] = useState(false);
  const [fullLogs, setFullLogs] = useState<LogItem[]>([]);
  const [loadingFullLogs, setLoadingFullLogs] = useState(false);

  const handleOpenFullLogs = async () => {
    setFullLogsOpen(true);
    setLoadingFullLogs(true);
    try {
      const data = await api.get<{ logs: LogItem[] }>("/admin/logs?limit=100");
      setFullLogs(data.logs);
    } catch (err) {
      toast.error("Failed to load complete activity logs");
    } finally {
      setLoadingFullLogs(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, weeklyRes, logsRes] = await Promise.all([
        api.get<SummaryData>("/admin/analytics/summary"),
        api.get<WeeklyData>("/admin/analytics/weekly"),
        api.get<{ logs: LogItem[] }>("/admin/logs?limit=5"),
      ]);
      setSummary(summaryRes);
      setWeekly(weeklyRes);
      setLogs(logsRes.logs);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    { labelKey: "admin.dashboard.totalUsers" as TranslationKey, value: String(summary?.totalUsers ?? 0), subKey: "admin.dashboard.activeAccounts" as TranslationKey },
    { labelKey: "admin.dashboard.documentsProcessed" as TranslationKey, value: String(summary?.totalDocuments ?? 0), subKey: "admin.dashboard.totalDocuments" as TranslationKey },
    { labelKey: "admin.dashboard.summariesGenerated" as TranslationKey, value: String(summary?.summariesGenerated ?? 0), subKey: "admin.dashboard.conciseSummaries" as TranslationKey },
    { labelKey: "admin.dashboard.translationsGenerated" as TranslationKey, value: String(summary?.translationsGenerated ?? 0), subKey: "admin.dashboard.translatedFiles" as TranslationKey },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("admin.dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("admin.dashboard.subtitle")}</p>
        </div>
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
                data={weekly.map((d) => ({
                  ...d,
                  name: t(`day.${d.name.toLowerCase()}` as TranslationKey) || d.name,
                }))}
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
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm text-muted-foreground font-medium">{formatLogDate(row.createdAt)}</TableCell>
                    <TableCell className="font-semibold text-sm text-[#163a5f] hover:underline cursor-pointer dark:text-[#3d6a94]">{row.user?.name || "System"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium">
                      {row.action}{row.details ? `: ${row.details}` : ""}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={getStatusForAction(row.action)} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium">
                      {row.comment || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No logs available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={handleOpenFullLogs}
              className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-full px-6 py-2.5 shadow-md cursor-pointer transition"
            >
              {t("admin.dashboard.viewFullLog")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={fullLogsOpen} onOpenChange={setFullLogsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle>Complete Activity Log</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 border rounded-md">
            {loadingFullLogs ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.dashboard.colDate")}</TableHead>
                    <TableHead>{t("admin.dashboard.colUserTrigger")}</TableHead>
                    <TableHead>{t("admin.dashboard.colActionLogged")}</TableHead>
                    <TableHead>{t("admin.dashboard.colStatus")}</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fullLogs.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm text-muted-foreground font-medium">{formatLogDate(row.createdAt)}</TableCell>
                      <TableCell className="font-semibold text-sm text-[#163a5f] hover:underline cursor-pointer dark:text-[#3d6a94]">{row.user?.name || "System"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium">
                        {row.action}{row.details ? `: ${row.details}` : ""}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={getStatusForAction(row.action)} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium">
                        {row.comment || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {fullLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No logs available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
