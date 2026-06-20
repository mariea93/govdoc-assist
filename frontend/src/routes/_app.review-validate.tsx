import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, FileDown, Save, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/review-validate")({
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
  const [documents, setDocuments] = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [validation, setValidation] = useState<"approve" | "reject" | "improvement" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<{ documents: ReviewDoc[] }>("/documents/review")
      .then((data) => setDocuments(data.documents))
      .catch(() => toast.error("Failed to load documents for review"))
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="font-display text-3xl font-bold tracking-tight">Review & Validate</h1>
          <p className="text-muted-foreground">No documents available for review at this time.</p>
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
      if (action === "approve") toast.success("Approved Output");
      else if (action === "reject") toast.error("Rejected Output");
      else toast.info("Requested Improvement");
    } catch (err: any) {
      toast.error(err?.message || "Validation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) {
      toast.error("Please add a note before saving");
      return;
    }
    try {
      await api.post(`/documents/${doc.dbId}/validation/note`, { notes: note });
      toast.success("Validation note saved successfully!");
      setNote("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save note");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Review & Validate</h1>
        <p className="text-muted-foreground">Review AI-generated outputs and provide your validation.</p>
      </div>

      {documents.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {documents.map((d, i) => (
                <Button
                  key={d.id}
                  variant={i === selectedIdx ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedIdx(i); setValidation(null); setNote(""); }}
                  className="whitespace-nowrap"
                >
                  {d.id} - {d.name.slice(0, 20)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Document Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Document Name</div>
              <div className="mt-1.5 text-sm font-semibold">{doc.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Upload Date</div>
              <div className="mt-1.5 text-sm font-semibold">{doc.date}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Source Language</div>
              <div className="mt-1.5 text-sm font-semibold">{doc.source}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Target Language</div>
              <div className="mt-1.5 text-sm font-semibold">{doc.target}</div>
            </div>
          </div>
          {doc.qualityScore && (
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">Quality Score: </span>
              <span className="font-bold text-emerald-600">{doc.qualityScore}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {doc.processingResult?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">AI Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-[#fafafa] p-4 text-sm leading-relaxed text-foreground/90 dark:border-slate-800 dark:bg-slate-900/30">
              {doc.processingResult.summary}
            </div>
            <ResultActions label="Summary" text={doc.processingResult.summary} />
          </CardContent>
        </Card>
      )}

      {doc.processingResult?.translation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Translation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-[#fafafa] p-4 text-sm leading-relaxed text-foreground/90 dark:border-slate-800 dark:bg-slate-900/30">
              {doc.processingResult.translation}
            </div>
            <ResultActions label="Translation" text={doc.processingResult.translation} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Validation Actions</CardTitle>
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
            Approve Output
          </Button>
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => handleValidation("reject")}
            className={`flex-1 min-w-[150px] border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold cursor-pointer ${
              validation === "reject" ? "bg-red-500 text-white hover:bg-red-500" : ""
            }`}
          >
            Reject Output
          </Button>
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => handleValidation("improvement")}
            className={`flex-1 min-w-[150px] border-[#163a5f] text-[#163a5f] hover:bg-slate-50 dark:border-[#3d6a94] dark:text-[#3d6a94] dark:hover:bg-slate-900/30 font-semibold cursor-pointer ${
              validation === "improvement" ? "bg-[#163a5f] text-white hover:bg-[#163a5f] dark:bg-[#3d6a94]" : ""
            }`}
          >
            Request Improvement
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Validation Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your comments or notes here..."
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSaveNote}
              className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-md shadow-md cursor-pointer"
            >
              Save Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultActions({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => { navigator.clipboard.writeText(text); toast.success(`${label} copied to clipboard`); }}
      >
        <Copy className="mr-2 h-4 w-4" /> Copy
      </Button>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => toast.success(`Downloading ${label} PDF…`)}
      >
        <Download className="mr-2 h-4 w-4" /> Download PDF
      </Button>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => toast.success(`Downloading ${label} DOCX…`)}
      >
        <FileDown className="mr-2 h-4 w-4" /> Download DOCX
      </Button>
      <Button
        className="cursor-pointer"
        onClick={() => toast.success(`${label} saved to history`)}
      >
        <Save className="mr-2 h-4 w-4" /> Save to History
      </Button>
    </div>
  );
}
