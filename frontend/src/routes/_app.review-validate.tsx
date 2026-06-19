import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, FileDown, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/review-validate")({
  head: () => ({ meta: [{ title: "Review & Validate · GovLingua AI" }] }),
  component: ReviewValidatePage,
});

const summaryText =
  "The report provides an overview of the district development progress for the year 2025. " +
  "It highlights key achievements in infrastructure, education, health, and agriculture. " +
  "Challenges such as budget constraints and supply chain delays were also identified. " +
  "The report concludes with recommendations for improving service delivery and community engagement.";

const translationText =
  "The report provides an overview of the district development progress for the year 2025. " +
  "It highlights key achievements in infrastructure, education, health, and agriculture. " +
  "Challenges such as budget constraints and supply chain delays were also identified. " +
  "The report concludes with recommendations for improving service delivery and community engagement.";

function ReviewValidatePage() {
  const [validation, setValidation] = useState<"approve" | "reject" | "improvement" | null>(null);
  const [note, setNote] = useState("");

  const handleValidation = (action: "approve" | "reject" | "improvement") => {
    setValidation(action);
    if (action === "approve") {
      toast.success("Approved Output");
    } else if (action === "reject") {
      toast.error("Rejected Output");
    } else if (action === "improvement") {
      toast.info("Requested Improvement");
    }
  };

  const handleSaveNote = () => {
    if (!note.trim()) {
      toast.error("Please add a note before saving");
      return;
    }
    toast.success("Validation note saved successfully!");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Review & Validate</h1>
        <p className="text-muted-foreground">Review AI-generated outputs and provide your validation.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Document Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Document Name</div>
              <div className="mt-1.5 text-sm font-semibold">District Development Report.pdf</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Upload Date</div>
              <div className="mt-1.5 text-sm font-semibold">12 Jun 2026 09:45</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Source Language</div>
              <div className="mt-1.5 text-sm font-semibold">Kinyarwanda</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Target Language</div>
              <div className="mt-1.5 text-sm font-semibold">English</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">AI Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-100 bg-[#fafafa] p-4 text-sm leading-relaxed text-foreground/90 dark:border-slate-800 dark:bg-slate-900/30">
            {summaryText}
          </div>
          <ResultActions label="Summary" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Translation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-100 bg-[#fafafa] p-4 text-sm leading-relaxed text-foreground/90 dark:border-slate-800 dark:bg-slate-900/30">
            {translationText}
          </div>
          <ResultActions label="Translation" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Validation Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => handleValidation("approve")}
            className={`flex-1 min-w-[150px] border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-semibold cursor-pointer ${
              validation === "approve" ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""
            }`}
          >
            Approve Output
          </Button>
          <Button
            variant="outline"
            onClick={() => handleValidation("reject")}
            className={`flex-1 min-w-[150px] border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold cursor-pointer ${
              validation === "reject" ? "bg-red-500 text-white hover:bg-red-500" : ""
            }`}
          >
            Reject Output
          </Button>
          <Button
            variant="outline"
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

function ResultActions({ label }: { label: string }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => toast.success(`${label} copied to clipboard`)}
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
