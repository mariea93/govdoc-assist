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
import { useLanguage } from "@/contexts/language-context";

const translateLanguage = (langName: string, t: any) => {
  if (langName === "Kinyarwanda") return t("languages.kinyarwanda.title");
  if (langName === "English") return t("languages.english.title");
  if (langName === "French") return t("languages.french.title");
  return langName;
};

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
  const { t } = useLanguage();
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

  const getActionLabel = (act: string) => {
    if (act === "Summarize") return t("history.summarize");
    if (act === "Translate") return t("history.translate");
    if (act === "Summarize + Translate") return t("history.summarizeTranslate");
    return act;
  };

  const getValidationStatusLabel = (valStatus: string) => {
    if (valStatus === "Approved") return t("status.approved");
    if (valStatus === "Rejected") return t("status.rejected");
    if (valStatus === "Improvement Requested") return t("status.improvement");
    if (valStatus === "Pending") return t("status.pending");
    return valStatus;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("history.title")}</h1>
        <p className="text-muted-foreground">{t("history.subtitle")}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t("history.searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger><SelectValue placeholder={t("history.language")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("history.allLanguages")}</SelectItem>
                {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{translateLanguage(l, t)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger><SelectValue placeholder={t("history.action")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("history.allActions")}</SelectItem>
                <SelectItem value="Summarize">{t("history.summarize")}</SelectItem>
                <SelectItem value="Translate">{t("history.translate")}</SelectItem>
                <SelectItem value="Summarize + Translate">{t("history.summarizeTranslate")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">{t("history.loadingDocs")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("history.colDocument")}</TableHead>
                    <TableHead>{t("history.colOriginal")}</TableHead>
                    <TableHead>{t("history.colTarget")}</TableHead>
                    <TableHead>{t("history.colAction")}</TableHead>
                    <TableHead>{t("history.colValidation")}</TableHead>
                    <TableHead>{t("history.colDate")}</TableHead>
                    <TableHead>{t("history.colTime")}</TableHead>
                    <TableHead>{t("history.colStatus")}</TableHead>
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
                      <TableCell><Badge variant="outline">{translateLanguage(d.source, t)}</Badge></TableCell>
                      <TableCell>
                        {displayTarget(d.action, d.target) === "-" ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <Badge variant="outline">{translateLanguage(d.target, t)}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getActionLabel(d.action)}</TableCell>
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
                            {getValidationStatusLabel(d.validationStatus)}
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
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">{t("history.noResults")}</TableCell>
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
