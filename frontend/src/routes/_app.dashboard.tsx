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
import { recentDocs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import type { TranslationKey } from "@/lib/i18n";
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

function Dashboard() {
  const { t } = useLanguage();
  const { role } = useAuth();

  // Employee Dashboard View
  if (role === "employee") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">Hello, Employee 👋</h1>
          <p className="text-muted-foreground">Manage, review and process government documents efficiently.</p>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Documents Processed", value: "128", sub: "Total documents" },
            { label: "Summaries Generated", value: "96", sub: "Total summaries" },
            { label: "Translations Generated", value: "84", sub: "Total translations" },
            { label: "Validation Actions", value: "67", sub: "Total validations" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-3">
          <h3 className="text-base font-bold tracking-tight text-foreground">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/upload"
              className="flex flex-col gap-2 rounded-xl p-5 border bg-blue-50/70 border-blue-100 hover:shadow-md transition cursor-pointer dark:bg-slate-800/40 dark:border-slate-800"
            >
              <span className="font-semibold text-sm text-[#163a5f] dark:text-[#a8b4c0]">Upload Document</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Upload new government documents to get started.
              </span>
            </Link>
            <Link
              to="/summarize"
              className="flex flex-col gap-2 rounded-xl p-5 border bg-emerald-50/70 border-emerald-100 hover:shadow-md transition cursor-pointer dark:bg-emerald-950/20 dark:border-emerald-900/30"
            >
              <span className="font-semibold text-sm text-[#2f6b4f] dark:text-[#a8c0b4]">Summarize Text</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Generate clear and concise summaries from documents.
              </span>
            </Link>
            <Link
              to="/translate"
              className="flex flex-col gap-2 rounded-xl p-5 border bg-amber-50/70 border-amber-100 hover:shadow-md transition cursor-pointer dark:bg-amber-950/20 dark:border-amber-900/30"
            >
              <span className="font-semibold text-sm text-[#b08711] dark:text-[#cbb580]">Translate Text</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Translate content into different languages.
              </span>
            </Link>
            <Link
              to="/review-validate"
              className="flex flex-col gap-2 rounded-xl p-5 border bg-purple-50/70 border-purple-100 hover:shadow-md transition cursor-pointer dark:bg-purple-950/20 dark:border-purple-900/30"
            >
              <span className="font-semibold text-sm text-[#6b21a8] dark:text-[#c4a8c0]">Review & Validation</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Review and validate summaries and translations.
              </span>
            </Link>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Weekly Activity</CardTitle>
            <p className="text-xs text-muted-foreground">Overview of your work this week</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Mon", documents: 12, summaries: 9, translations: 7, validations: 5 },
                    { name: "Tue", documents: 18, summaries: 13, translations: 10, validations: 7 },
                    { name: "Wed", documents: 15, summaries: 20, translations: 17, validations: 10 },
                    { name: "Thu", documents: 24, summaries: 26, translations: 21, validations: 14 },
                    { name: "Fri", documents: 22, summaries: 18, translations: 15, validations: 10 },
                    { name: "Sat", documents: 10, summaries: 8, translations: 6, validations: 4 },
                    { name: "Sun", documents: 7, summaries: 4, translations: 3, validations: 2 },
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
                    fill="#c9a227"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={12}
                  />
                  <Bar
                    dataKey="validations"
                    name="validations"
                    fill="#8b5cf6"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={12}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { date: "12 Jun 2026 09:45", doc: "District Development Report.pdf", action: "Summarized", status: "Completed" as const },
                    { date: "12 Jun 2026 09:20", doc: "Budget Allocation 2026.xlsx", action: "Translated", status: "Completed" as const },
                    { date: "11 Jun 2026 16:10", doc: "Policy Brief.docx", action: "Reviewed", status: "Approved" as const },
                    { date: "11 Jun 2026 15:35", doc: "Meeting Minutes.pdf", action: "Summarized", status: "Completed" as const },
                    { date: "10 Jun 2026 11:05", doc: "Citizen Request Letter.pdf", action: "Translated", status: "Completed" as const },
                  ].map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm text-muted-foreground font-medium">{row.date}</TableCell>
                      <TableCell className="font-semibold text-sm text-[#163a5f] hover:underline cursor-pointer dark:text-[#3d6a94]">{row.doc}</TableCell>
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
              <Button asChild className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-full px-6 py-2.5 shadow-md cursor-pointer transition">
                <Link to="/history">View Full History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Citizen Dashboard View
  const stats = [
    { labelKey: "dashboard.documentsProcessed" as TranslationKey, value: "1,284", trendKey: "dashboard.trendMonth" as TranslationKey, trendValue: 12 },
    { labelKey: "dashboard.summariesGenerated" as TranslationKey, value: "962", trendKey: "dashboard.trendMonth" as TranslationKey, trendValue: 8 },
    { labelKey: "dashboard.translationsCompleted" as TranslationKey, value: "734", trendKey: "dashboard.trendMonth" as TranslationKey, trendValue: 15 },
    { labelKey: "dashboard.timeSaved" as TranslationKey, value: "412 hrs", trendKey: "dashboard.trendManual" as TranslationKey },
  ];

  const quickActions = [
    { to: "/upload", titleKey: "sidebar.upload" as TranslationKey },
    { to: "/summarize", titleKey: "sidebar.summarize" as TranslationKey },
    { to: "/translate", titleKey: "sidebar.translate" as TranslationKey },
  ];

  const weeklyData = [
    { name: t("day.mon"), summaries: 12, translations: 8 },
    { name: t("day.tue"), summaries: 19, translations: 12 },
    { name: t("day.wed"), summaries: 15, translations: 22 },
    { name: t("day.thu"), summaries: 25, translations: 18 },
    { name: t("day.fri"), summaries: 22, translations: 15 },
    { name: t("day.sat"), summaries: 8, summariesLabelKey: "day.sat", translations: 5 },
    { name: t("day.sun"), summaries: 5, summariesLabelKey: "day.sun", translations: 3 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("dashboard.greeting")}</h1>
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
                  <p className="mt-1 text-xs text-success font-medium">
                    {"trendValue" in s ? t(s.trendKey, { value: s.trendValue }) : t(s.trendKey)}
                  </p>
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
          <p className="text-sm text-muted-foreground">
            {t("dashboard.weeklyActivitySubtitle")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
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
                  cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md space-y-1.5 text-xs">
                          <p className="font-semibold text-foreground">{label}</p>
                          {payload.map((p) => (
                            <div key={p.name} className="flex items-center gap-3">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-muted-foreground font-medium">
                                {p.name === "summaries" ? t("dashboard.summariesGenerated") : t("dashboard.translationsCompleted")}
                              </span>
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
                  height={32}
                  iconType="circle"
                  iconSize={6}
                  formatter={(value) => (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {value === "summaries" ? t("dashboard.summariesGenerated") : t("dashboard.translationsCompleted")}
                    </span>
                  )}
                />
                <Bar
                  dataKey="summaries"
                  name="summaries"
                  fill="var(--brand-green)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="translations"
                  name="translations"
                  fill="var(--brand-yellow)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
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
                {recentDocs.slice(0, 3).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      {d.name}
                    </TableCell>
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
