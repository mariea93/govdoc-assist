import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Eye, FileText, Search, Copy, X, Loader2 } from "lucide-react";
import { LANGUAGES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

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
  status: string;
  size: string;
  qualityScore?: number | null;
  processingResult?: {
    summary?: string;
    translation?: string;
    generatedAt?: string;
  } | null;
};

function History() {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("all");
  const [action, setAction] = useState("all");
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  const viewDocument = async (doc: DocItem) => {
    setLoadingDetail(true);
    setSelectedDoc(doc);
    try {
      const detail = await api.get<DocItem>(`/documents/${doc.dbId}`);
      setSelectedDoc(detail);
    } catch {
      toast.error("Failed to load document details");
    } finally {
      setLoadingDetail(false);
    }
  };

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
                            <div className="text-xs text-muted-foreground/50">{d.id} · {d.size}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{d.source}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{d.target}</Badge></TableCell>
                      <TableCell>{d.action}</TableCell>
                      <TableCell className="text-muted-foreground">{d.date}</TableCell>
                      <TableCell><StatusBadge status={d.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="View document"
                          onClick={() => viewDocument(d)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => { if (!open) setSelectedDoc(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDoc?.name}
            </DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : selectedDoc ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 bg-muted/30">
                <InfoItem label="Reference" value={selectedDoc.id} />
                <InfoItem label="Status" value={selectedDoc.status} />
                <InfoItem label="Source Language" value={selectedDoc.source} />
                <InfoItem label="Target Language" value={selectedDoc.target} />
                <InfoItem label="Action" value={selectedDoc.action} />
                <InfoItem label="Date" value={selectedDoc.date} />
                <InfoItem label="File Size" value={selectedDoc.size} />
                {selectedDoc.qualityScore && (
                  <InfoItem label="Quality Score" value={`${selectedDoc.qualityScore}%`} />
                )}
              </div>

              {selectedDoc.processingResult?.summary && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">AI Summary</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedDoc.processingResult!.summary!);
                        toast.success("Summary copied");
                      }}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed">
                    {selectedDoc.processingResult.summary}
                  </div>
                </div>
              )}

              {selectedDoc.processingResult?.translation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Translation</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedDoc.processingResult!.translation!);
                        toast.success("Translation copied");
                      }}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed">
                    {selectedDoc.processingResult.translation}
                  </div>
                </div>
              )}

              {!selectedDoc.processingResult?.summary && !selectedDoc.processingResult?.translation && (
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                  {selectedDoc.status === "Processing"
                    ? "This document is currently being processed by the AI service."
                    : selectedDoc.status === "Failed"
                      ? "Processing failed for this document. Please try uploading again."
                      : "No results available yet."}
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
