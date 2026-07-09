import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FileText, Search } from "lucide-react";
import { LANGUAGES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "History · GovLingua AI" }] }),
  component: History,
});

type DocItem = {
  id: string;
  dbId: string;
  name: string;
  source: string;
  target: string;
  action: string;
  date: string;
  time?: string;
  status: string;
  size: string;
  validationStatus: string;
};

function displayTarget(action: string, target: string) {
  return action === "Summarize" ? "-" : target;
}

export function History() {
  const { role } = useAuth();
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("all");
  const [action, setAction] = useState("all");
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<{ documents: DocItem[] }>("/documents");
        setDocuments(data.documents);
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = documents.filter((d) => {
    if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (lang !== "all" && d.source !== lang && d.target !== lang) return false;
    if (action !== "all" && d.action !== action) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Document History</h1>
        <p className="text-muted-foreground">Search and review all previously processed documents.</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by document name…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All languages</SelectItem>
                {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="Summarize">Summarize</SelectItem>
                <SelectItem value="Translate">Translate</SelectItem>
                <SelectItem value="Summarize + Translate">Summarize + Translate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading documents...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Original</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={role === "employee" ? "/review-validate" : "/results"}
                          search={{ doc: d.dbId }}
                          className="flex items-center gap-2 hover:underline text-[#163a5f] dark:text-[#3d6a94] cursor-pointer"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{d.name}</div>
                            <div className="text-xs text-muted-foreground/50">{d.id} · {d.size}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell><Badge variant="outline">{d.source}</Badge></TableCell>
                      <TableCell>
                        {displayTarget(d.action, d.target) === "-" ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <Badge variant="outline">{d.target}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{d.action}</TableCell>
                      <TableCell>
                        {d.validationStatus === "-" ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <Badge
                            variant="outline"
                            className={
                              d.validationStatus === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                                : d.validationStatus === "Rejected"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800"
                                  : d.validationStatus === "Improvement Requested"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
                                    : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800"
                            }
                          >
                            {d.validationStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{d.date}</TableCell>
                      <TableCell className="text-muted-foreground">{d.time ?? "—"}</TableCell>
                      <TableCell><StatusBadge status={d.status as any} /></TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No documents match your filters.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
