import { createFileRoute } from "@tanstack/react-router";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { exportAuditLogPDF, exportReportsCSV } from "@/lib/download-helper";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics · GovLingua AI" }] }),
  component: AdminReports,
});

const usageData = [
  { name: "Mon", documents: 42, summaries: 28, translations: 22, validations: 15 },
  { name: "Tue", documents: 58, summaries: 35, translations: 30, validations: 21 },
  { name: "Wed", documents: 51, summaries: 44, translations: 38, validations: 26 },
  { name: "Thu", documents: 67, summaries: 52, translations: 41, validations: 33 },
  { name: "Fri", documents: 63, summaries: 48, translations: 36, validations: 29 },
  { name: "Sat", documents: 24, summaries: 16, translations: 12, validations: 9 },
  { name: "Sun", documents: 18, summaries: 11, translations: 8, validations: 6 },
];

const distributionData = [
  { name: "Documents", value: 323, color: "#163a5f" },
  { name: "Summaries", value: 234, color: "#2f6b4f" },
  { name: "Translations", value: 187, color: "#c9a227" },
  { name: "Validations", value: 139, color: "#8b5cf6" },
];

const analyticsSummary = [
  { label: "Most Active Service", value: "Translation", sub: "38% of weekly activity" },
  { label: "Most Used Language Pair", value: "English → Kinyarwanda", sub: "412 requests this month" },
  { label: "Validation Approval Rate", value: "94%", sub: "Approved vs. rejected outputs" },
  { label: "Average Processing Time", value: "8.4 sec", sub: "Per document workflow" },
];

const reportOverview = [
  { report: "Document Processing Summary", period: "Jun 2026", generated: "15 Jun 2026", status: "Completed" as const },
  { report: "Translation Activity Report", period: "Jun 2026", generated: "14 Jun 2026", status: "Completed" as const },
  { report: "Validation Audit Report", period: "Jun 2026", generated: "13 Jun 2026", status: "Completed" as const },
  { report: "User Activity Log", period: "May 2026", generated: "01 Jun 2026", status: "Completed" as const },
  { report: "System Performance Report", period: "May 2026", generated: "31 May 2026", status: "Processing" as const },
];

function AdminReports() {
  const handleExportAuditLog = async () => {
    try {
      const toastId = toast.loading("Generating Audit Log PDF...");
      const data = await api.get<{ logs: any[] }>("/admin/logs?limit=10000");
      exportAuditLogPDF(data.logs);
      toast.dismiss(toastId);
      toast.success("Audit Log PDF exported successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to export audit log");
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const toastId = toast.loading("Generating CSV Report...");
      const data = await api.get<{ documents: any[] }>("/documents?limit=100000");
      exportReportsCSV(data.documents);
      toast.dismiss(toastId);
      toast.success("CSV Report downloaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download CSV report");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Analyze document metrics, translation activity, and validation reports.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Usage Chart</CardTitle>
          <p className="text-xs text-muted-foreground">Weekly document, summary, translation, and validation activity</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                              <span className="text-muted-foreground font-medium capitalize">{p.name}</span>
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
                    <span className="text-[11px] font-medium text-muted-foreground mr-3 capitalize">
                      {value}
                    </span>
                  )}
                />
                <Bar dataKey="documents" fill="#163a5f" radius={[3, 3, 0, 0]} maxBarSize={12} />
                <Bar dataKey="summaries" fill="#2f6b4f" radius={[3, 3, 0, 0]} maxBarSize={12} />
                <Bar dataKey="translations" fill="#c9a227" radius={[3, 3, 0, 0]} maxBarSize={12} />
                <Bar dataKey="validations" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Analytics Summary</CardTitle>
          <p className="text-xs text-muted-foreground">Key insights from this week&apos;s platform activity</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {analyticsSummary.map((item) => (
                <div key={item.label} className="rounded-lg border p-4">
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className="mt-2 font-display text-lg font-bold text-[#163a5f] dark:text-[#3d6a94]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Activity Distribution</p>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {distributionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as (typeof distributionData)[number];
                          return (
                            <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md text-xs">
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p className="text-muted-foreground">{item.value} total this week</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-[11px] font-medium text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Reports Overview</CardTitle>
          <p className="text-xs text-muted-foreground">Recently generated and scheduled reports</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportOverview.map((row) => (
                  <TableRow key={row.report}>
                    <TableCell className="font-semibold text-sm text-[#163a5f] dark:text-[#3d6a94]">
                      {row.report}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.period}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.generated}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={handleExportAuditLog}
              className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-full px-6 py-2.5 shadow-md cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" /> Export PDF Audit Log
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              className="font-semibold rounded-full px-6 py-2.5 cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" /> Download CSV Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
