import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, FileDown, Save, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { downloadAsPDF, downloadAsDOCX } from "@/lib/download-helper";
import { useLanguage } from "@/contexts/language-context";

const translateLanguage = (langName: string, t: any) => {
  if (langName === "Kinyarwanda") return t("languages.kinyarwanda.title");
  if (langName === "English") return t("languages.english.title");
  if (langName === "French") return t("languages.french.title");
  return langName;
};

export const Route = createFileRoute("/_app/review-validate")({
  validateSearch: (search: Record<string, unknown>) => ({
    doc: typeof search.doc === "string" ? search.doc : undefined,
  }),
  head: () => ({ meta: [{ title: "Review & Validate · GovLingua AI" }] }),
  component: ReviewValidatePage,
});

type ReviewDoc = {
  id: string;
  dbId: string;
  name: string;
  source: string;
  target: string;
  action: string;
  date: string;
  qualityScore: number | null;
  submittedBy: { name: string; email: string; office: string };
  processingResult: { summary?: string; translation?: string } | null;
  validations: any[];
  validated: boolean;
};

function ReviewValidatePage() {
  const { t } = useLanguage();
  const { doc: docId } = Route.useSearch();
  const [documents, setDocuments] = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [validation, setValidation] = useState<"approve" | "reject" | "improvement" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (docId) {
          const detail = await api.get<ReviewDoc>(`/documents/${docId}`);
          setDocuments([detail]);
          setSelectedIdx(0);
        } else {
          const data = await api.get<{ documents: ReviewDoc[] }>("/documents/review");
          setDocuments(data.documents);
        }
      } catch {
        toast.error(t("review.failedLoad"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [docId, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("review.title")}</h1>
          <p className="text-muted-foreground">{t("review.noDocs")}</p>
        </div>
      </div>
    );
  }

  const doc = documents[selectedIdx];

  const handleValidation = async (action: "approve" | "reject" | "improvement") => {
    setSubmitting(true);
    try {
      await api.post(`/documents/${doc.dbId}/validation`, {
        action,
        feedback: note || undefined,
      });
      setValidation(action);
      if (action === "approve") toast.success(t("review.approved"));
      else if (action === "reject") toast.error(t("review.rejected"));
      else toast.info(t("review.improvementRequested"));
    } catch (err: any) {
      toast.error(err?.message || t("review.failedValidation"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) {
      toast.error(t("review.noteRequired"));
      return;
    }
    try {
      await api.post(`/documents/${doc.dbId}/validation/note`, { notes: note });
      toast.success(t("review.noteSaved"));
      setNote("");
    } catch (err: any) {
      toast.error(err?.message || t("review.failedNote"));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("review.title")}</h1>
        <p className="text-muted-foreground">{t("review.subtitle")}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("review.docInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">{t("review.docName")}</div>
              <div className="mt-1.5 text-sm font-semibold">{doc.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">{t("review.uploadDate")}</div>
              <div className="mt-1.5 text-sm font-semibold">{doc.date}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">{t("review.sourceLanguage")}</div>
              <div className="mt-1.5 text-sm font-semibold">{translateLanguage(doc.source, t)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">{t("review.targetLanguage")}</div>
              <div className="mt-1.5 text-sm font-semibold">{doc.action === "Summarize" ? "-" : translateLanguage(doc.target, t)}</div>
            </div>
          </div>
          {doc.qualityScore && (
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">{t("results.qualityScore")}: </span>
              <span className="font-bold text-emerald-600">{doc.qualityScore}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {!doc.processingResult?.summary && !doc.processingResult?.translation && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            {t("results.processingPlaceholder")}
          </CardContent>
        </Card>
      )}

      {doc.processingResult?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("review.summary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-[#fafafa] p-4 text-sm leading-relaxed text-foreground/90 dark:border-slate-800 dark:bg-slate-900/30">
              {doc.processingResult.summary}
            </div>
            <ResultActions label="Summary" text={doc.processingResult.summary} fileName={doc.name} />
          </CardContent>
        </Card>
      )}

      {doc.processingResult?.translation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("review.translation")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-[#fafafa] p-4 text-sm leading-relaxed text-foreground/90 dark:border-slate-800 dark:bg-slate-900/30">
              {doc.processingResult.translation}
            </div>
            <ResultActions label="Translation" text={doc.processingResult.translation} fileName={doc.name} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">{t("review.validationActions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => handleValidation("approve")}
            className={`flex-1 min-w-[150px] border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-semibold cursor-pointer ${
              validation === "approve" ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""
            }`}
          >
            {t("review.approve")}
          </Button>
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => handleValidation("reject")}
            className={`flex-1 min-w-[150px] border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold cursor-pointer ${
              validation === "reject" ? "bg-red-500 text-white hover:bg-red-500" : ""
            }`}
          >
            {t("review.reject")}
          </Button>
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => handleValidation("improvement")}
            className={`flex-1 min-w-[150px] border-[#163a5f] text-[#163a5f] hover:bg-slate-50 dark:border-[#3d6a94] dark:text-[#3d6a94] dark:hover:bg-slate-900/30 font-semibold cursor-pointer ${
              validation === "improvement" ? "bg-[#163a5f] text-white hover:bg-[#163a5f] dark:bg-[#3d6a94]" : ""
            }`}
          >
            {t("review.improvement")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">{t("review.notes")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("review.notesPlaceholder")}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSaveNote}
              className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-md shadow-md cursor-pointer"
            >
              {t("review.saveNote")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultActions({ label, text, fileName }: { label: string; text: string; fileName: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => { navigator.clipboard.writeText(text); toast.success(t("results.copied")); }}
      >
        <Copy className="mr-2 h-4 w-4" /> {t("results.copy")}
      </Button>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => {
          downloadAsPDF({
            fileName,
            summary: label === "Summary" ? text : undefined,
            translation: label === "Translation" ? text : undefined,
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
            fileName,
            summary: label === "Summary" ? text : undefined,
            translation: label === "Translation" ? text : undefined,
          });
          toast.success(t("results.docxStarted"));
        }}
      >
        <FileDown className="mr-2 h-4 w-4" /> {t("results.downloadDocx")}
      </Button>
    </div>
  );
}
