import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Languages,
  Upload as UploadIcon,
  Clock,
  TrendingUp,
  History as HistoryIcon,
  ArrowUpRight,
} from "lucide-react";
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

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · GovLingua AI" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Documents Processed", value: "1,284", icon: FileText, trend: "+12% this month", color: "var(--brand-blue)" },
  { label: "Summaries Generated", value: "962", icon: TrendingUp, trend: "+8% this month", color: "var(--brand-green)" },
  { label: "Translations Completed", value: "734", icon: Languages, trend: "+15% this month", color: "var(--brand-yellow)" },
  { label: "Time Saved", value: "412 hrs", icon: Clock, trend: "vs. manual work", color: "var(--brand-blue)" },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Muraho neza, Uwase 👋</h1>
        <p className="text-muted-foreground">Here is what's happening in your district office today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs text-success">{s.trend}</p>
                </div>
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: `color-mix(in oklab, ${s.color} 18%, transparent)`, color: s.color }}
                >
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/upload", title: "Upload Document", icon: UploadIcon, color: "var(--brand-blue)" },
          { to: "/summarize", title: "Summarize Text", icon: FileText, color: "var(--brand-green)" },
          { to: "/translate", title: "Translate Text", icon: Languages, color: "var(--brand-yellow)" },
          { to: "/history", title: "View History", icon: HistoryIcon, color: "var(--brand-blue)" },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group rounded-xl border bg-card p-5 transition hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: `color-mix(in oklab, ${a.color} 18%, transparent)`, color: a.color }}
              >
                <a.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div className="mt-4 font-semibold">{a.title}</div>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent documents</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/history">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDocs.slice(0, 5).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {d.name}
                      </div>
                    </TableCell>
                    <TableCell>{d.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{d.source} → {d.target}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.date}</TableCell>
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
