import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye, FileText, Search } from "lucide-react";
import { recentDocs, LANGUAGES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "History · GovLingua AI" }] }),
  component: History,
});

function History() {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("all");
  const [action, setAction] = useState("all");

  const filtered = recentDocs.filter((d) => {
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{d.name}</div>
                          <div className="text-xs text-muted-foreground">{d.id} · {d.size}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{d.source}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{d.target}</Badge></TableCell>
                    <TableCell>{d.action}</TableCell>
                    <TableCell className="text-muted-foreground">{d.date}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm"><Eye className="mr-1 h-3.5 w-3.5" /> View</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No documents match your filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
