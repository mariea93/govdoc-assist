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
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import type { TranslationKey } from "@/lib/i18n";
import { api } from "@/lib/api-client";
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

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · GovLingua AI" }] }),
  component: Dashboard,
});

type DashboardData = {
  totalDocuments: number;
  completed: number;
  processing: number;
  failed: number;
  pendingValidations: number;
  totalUsers: number;
  recentDocuments: { id: string; name: string; source: string; target: string; action: string; date: string; status: string }[];
  actionBreakdown: { action: string; count: number }[];
  languageBreakdown: { language: string; count: number }[];
};

type WeeklyActivity = { day: string; uploads: number; completed: number }[];

function Dashboard() {
  const { t } = useLanguage();
  const { role, session } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [weekly, setWeekly] = useState<WeeklyActivity>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashData, weeklyData] = await Promise.all([
          api.get<DashboardData>("/dashboard"),
          api.get<WeeklyActivity>("/dashboard/weekly-activity"),
        ]);
        setData(dashData);
        setWeekly(weeklyData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("dashboard.greeting")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="h-16 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (role === "employee") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("employee.greeting", { name: session?.name ?? "" })}</h1>
          <p className="text-muted-foreground">{t("employee.subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { labelKey: "employee.documentsProcessed" as TranslationKey, value: String(data.totalDocuments), subKey: "employee.totalDocuments" as TranslationKey },
            { labelKey: "employee.completed" as TranslationKey, value: String(data.completed), subKey: "employee.successfullyProcessed" as TranslationKey },
            { labelKey: "employee.processing" as TranslationKey, value: String(data.processing), subKey: "employee.currentlyInProgress" as TranslationKey },
            { labelKey: "employee.pendingValidation" as TranslationKey, value: String(data.pendingValidations), subKey: "employee.awaitingReview" as TranslationKey },
          ].map((s) => (
            <Card key={s.labelKey}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground font-medium">{t(s.labelKey)}</p>
                <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">{t(s.subKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold tracking-tight text-foreground">{t("employee.quickActions")}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/upload" className="flex flex-col gap-2 rounded-xl p-5 border bg-blue-50/70 border-blue-100 hover:shadow-md transition cursor-pointer dark:bg-slate-800/40 dark:border-slate-800">
              <span className="font-semibold text-sm text-[#163a5f] dark:text-[#a8b4c0]">{t("sidebar.upload")}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{t("employee.uploadDesc")}</span>
            </Link>
            <Link to="/summarize" className="flex flex-col gap-2 rounded-xl p-5 border bg-emerald-50/70 border-emerald-100 hover:shadow-md transition cursor-pointer dark:bg-emerald-950/20 dark:border-emerald-900/30">
              <span className="font-semibold text-sm text-[#2f6b4f] dark:text-[#a8c0b4]">{t("sidebar.summarize")}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{t("employee.summarizeDesc")}</span>
            </Link>
            <Link to="/translate" className="flex flex-col gap-2 rounded-xl p-5 border bg-amber-50/70 border-amber-100 hover:shadow-md transition cursor-pointer dark:bg-amber-950/20 dark:border-amber-900/30">
              <span className="font-semibold text-sm text-[#b08711] dark:text-[#cbb580]">{t("sidebar.translate")}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{t("employee.translateDesc")}</span>
            </Link>
            <Link to="/review-validate" className="flex flex-col gap-2 rounded-xl p-5 border bg-purple-50/70 border-purple-100 hover:shadow-md transition cursor-pointer dark:bg-purple-950/20 dark:border-purple-900/30">
              <span className="font-semibold text-sm text-[#6b21a8] dark:text-[#c4a8c0]">{t("sidebar.reviewValidate")}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{t("employee.reviewDesc")}</span>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("employee.weeklyActivity")}</CardTitle>
            <p className="text-xs text-muted-foreground">{t("employee.weeklyActivitySub")}</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                  <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.02)" }} />
                  <Legend verticalAlign="top" height={36} iconType="rect" iconSize={10} />
                  <Bar dataKey="uploads" name={t("sidebar.upload")} fill="#163a5f" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="completed" name={t("employee.completed")} fill="#2f6b4f" radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("employee.recentDocuments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("employee.colDocument")}</TableHead>
                    <TableHead>{t("employee.colAction")}</TableHead>
                    <TableHead>{t("employee.colStatus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentDocuments.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.action}</TableCell>
                      <TableCell><StatusBadge status={d.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-center mt-4">
              <Button asChild className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-full px-6 py-2.5 shadow-md cursor-pointer transition">
                <Link to="/history">{t("employee.viewFullHistory")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { labelKey: "dashboard.documentsProcessed" as TranslationKey, value: String(data.totalDocuments) },
    { labelKey: "dashboard.summariesGenerated" as TranslationKey, value: String(data.completed) },
    { labelKey: "dashboard.translationsCompleted" as TranslationKey, value: String(data.processing) },
    { labelKey: "dashboard.timeSaved" as TranslationKey, value: `${Math.round(data.totalDocuments * 0.3)} hrs` },
  ];

  const quickActions = [
    { to: "/upload", titleKey: "sidebar.upload" as TranslationKey },
    { to: "/summarize", titleKey: "sidebar.summarize" as TranslationKey },
    { to: "/translate", titleKey: "sidebar.translate" as TranslationKey },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("dashboard.greeting")}
        </h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{t(s.labelKey)}</p>
                  <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group flex items-center gap-3.5 rounded-xl border bg-card p-4 transition hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">{t(a.titleKey)}</div>
            </div>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.weeklyActivity")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("dashboard.weeklyActivitySubtitle")}</p>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.04)" }} />
                <Legend verticalAlign="top" height={32} iconType="circle" iconSize={6}
                  formatter={(value) => (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {value === "uploads" ? t("dashboard.summariesGenerated") : t("dashboard.translationsCompleted")}
                    </span>
                  )}
                />
                <Bar dataKey="uploads" name="uploads" fill="var(--brand-green)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="completed" name="completed" fill="var(--brand-yellow)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("dashboard.recentDocuments")}</CardTitle>
          <Button variant="outline" size="sm" asChild className="cursor-pointer">
            <Link to="/history">{t("dashboard.viewAll")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboard.colDocument")}</TableHead>
                  <TableHead>{t("dashboard.colAction")}</TableHead>
                  <TableHead>{t("dashboard.colStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentDocuments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.action}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
