import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Save, FileDown, CheckCircle2, XCircle, MessageSquarePlus, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { downloadAsPDF, downloadAsDOCX } from "@/lib/download-helper";
import { useLanguage } from "@/contexts/language-context";

type ValidationAction = "approve" | "reject" | "improvement" | null;

const translateLanguage = (langName: string, t: any) => {
  if (langName === "Kinyarwanda") return t("languages.kinyarwanda.title");
  if (langName === "English") return t("languages.english.title");
  if (langName === "French") return t("languages.french.title");
  return langName;
};

export const Route = createFileRoute("/_app/results")({
  validateSearch: (search: Record<string, unknown>) => ({
    doc: typeof search.doc === "string" ? search.doc : undefined,
  }),
  head: () => ({ meta: [{ title: "Results · GovLingua AI" }] }),
  component: Results,
});

type DocResult = {
  id: string;
  dbId: string;
  name: string;
  source: string;
  target: string;
  action: string;
  status: string;
  qualityScore: number | null;
  processingResult: { summary?: string; translation?: string } | null;
  validations?: any[];
};

function Results() {
  const { t } = useLanguage();
  const { doc: docId } = Route.useSearch();
  const { session } = useAuth();
  const [validation, setValidation] = useState<ValidationAction>(null);
  const [feedback, setFeedback] = useState("");
  const [doc, setDoc] = useState<DocResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (doc && session) {
      const userVal = doc.validations?.find((v: any) => v.userId === session.id);
      if (userVal) {
        const actionMap: Record<string, ValidationAction> = {
          APPROVE: "approve",
          REJECT: "reject",
          IMPROVEMENT: "improvement",
        };
        setValidation(actionMap[userVal.action] || null);
        setFeedback(userVal.feedback || "");
      }
    }
  }, [doc, session]);

  useEffect(() => {
    async function load() {
      try {
        let currentDocId = docId;
        if (!currentDocId) {
          const res = await api.get<{ documents: DocResult[] }>("/documents?status=completed&limit=1");
          if (res.documents && res.documents.length > 0) {
            currentDocId = res.documents[0].dbId;
          }
        }
        if (!currentDocId) {
          setDoc(null);
          setLoading(false);
          return;
        }
        const detail = await api.get<DocResult>(`/documents/${currentDocId}`);
        setDoc(detail);
      } catch {
        setDoc(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [docId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const docItem = doc;

  if (!docItem) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("results.title")}</h1>
          <p className="text-muted-foreground">{t("results.noDocs")}</p>
        </div>
        <Button asChild>
          <Link to="/upload">{t("sidebar.upload")}</Link>
        </Button>
      </div>
    );
  }

  const handleValidation = async (action: ValidationAction) => {
    if (!action || !docItem) return;
    setValidation(action);
    try {
      await api.post(`/documents/${docItem.dbId}/validation`, {
        action,
      });
      if (action === "approve") toast.success(t("results.approved"));
      else if (action === "reject") toast.error(t("results.rejected"));
      else if (action === "improvement") toast.info(t("results.improvementRequested"));

      // Refresh document details to update history and status
      const detail = await api.get<DocResult>(`/documents/${docItem.dbId}`);
      setDoc(detail);
    } catch (err: any) {
      toast.error(err?.message || t("results.failedValidation"));
    }
  };

  const handleSaveComment = async () => {
    if (!feedback.trim()) {
      toast.error(t("results.commentRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/documents/${docItem.dbId}/validation`, {
        feedback: feedback.trim(),
      });
      toast.success(t("results.commentSaved"));

      // Refresh document details to update local validation details
      const detail = await api.get<DocResult>(`/documents/${docItem.dbId}`);
      setDoc(detail);
    } catch (err: any) {
      toast.error(err?.message || t("results.failedComment"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("results.title")}</h1>
          <p className="text-muted-foreground">{t("results.subtitle")}</p>
        </div>
        <Button asChild variant="outline" className="cursor-pointer">
          <Link to="/upload">{t("results.processAnother")}</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <Info label={t("results.document")} value={docItem.name} />
          <Info label={t("results.originalLanguage")} value={translateLanguage(docItem.source, t)} />
          <Info label={t("results.translatedTo")} value={docItem.action === "Summarize" ? "-" : translateLanguage(docItem.target, t)} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {docItem.processingResult?.summary && (
          <ResultPanel
            title={t("results.summary")}
            badge={translateLanguage(docItem.source, t)}
            body={docItem.processingResult.summary}
          />
        )}
        {docItem.processingResult?.translation && (
          <ResultPanel
            title={t("results.translation")}
            badge={translateLanguage(docItem.target, t)}
            body={docItem.processingResult.translation}
          />
        )}
        {!docItem.processingResult?.summary && !docItem.processingResult?.translation && (
          <Card className="lg:col-span-2">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {docItem.status === "Processing" || docItem.status === "Pending"
                ? t("results.processingPlaceholder")
                : t("results.noResults")}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">{t("results.humanValidation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={validation === "approve" ? "default" : "outline"}
              className={`cursor-pointer ${validation === "approve" ? "border-success bg-success text-success-foreground hover:bg-success/90" : ""}`}
              onClick={() => handleValidation("approve")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> {t("results.approve")}
            </Button>
            <Button
              variant={validation === "reject" ? "destructive" : "outline"}
              className="cursor-pointer"
              onClick={() => handleValidation("reject")}
            >
              <XCircle className="mr-2 h-4 w-4" /> {t("results.reject")}
            </Button>
            <Button
              variant={validation === "improvement" ? "secondary" : "outline"}
              className="cursor-pointer"
              onClick={() => handleValidation("improvement")}
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" /> {t("results.improvement")}
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("results.feedbackPlaceholder")}
              className="min-h-[100px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" className="cursor-pointer" onClick={() => { navigator.clipboard.writeText(docItem.processingResult?.summary || docItem.processingResult?.translation || ""); toast.success(t("results.copied")); }}>
          <Copy className="mr-2 h-4 w-4" /> {t("results.copy")}
        </Button>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            downloadAsPDF({
              fileName: docItem.name,
              summary: docItem.processingResult?.summary || undefined,
              translation: docItem.processingResult?.translation || undefined,
            });
            toast.success(t("results.pdfStarted"));
          }}
        >
          <Download className="mr-2 h-4 w-4" /> {t("results.downloadPdf")}
        </Button>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            downloadAsDOCX({
              fileName: docItem.name,
              summary: docItem.processingResult?.summary || undefined,
              translation: docItem.processingResult?.translation || undefined,
            });
            toast.success(t("results.docxStarted"));
          }}
        >
          <FileDown className="mr-2 h-4 w-4" /> {t("results.downloadDocx")}
        </Button>
        <Button className="cursor-pointer" disabled={submitting} onClick={handleSaveComment}>
          <Save className="mr-2 h-4 w-4" /> {t("results.saveComment")}
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-sm font-semibold">{value}</div>
    </div>
  );
}

function ResultPanel({ title, badge, body }: { title: string; badge: string; body: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <Badge variant="outline">{badge}</Badge>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{body}</p>
      </CardContent>
    </Card>
  );
}
