import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Download, Loader2 } from "lucide-react";
import { LANGUAGES } from "@/lib/mock-data";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { getPostProcessRoute } from "@/lib/post-process-nav";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { waitForDocument } from "@/lib/wait-for-document";

export const Route = createFileRoute("/_app/summarize")({
  head: () => ({ meta: [{ title: "Summarize Text · GovLingua AI" }] }),
  component: SummarizePage,
});

const SAMPLE = "The district administration today released its quarterly report detailing progress on infrastructure, education, and healthcare initiatives across all sectors. Key highlights include the completion of three new health posts, the rehabilitation of 42 kilometres of feeder roads, and the enrolment of an additional 1,200 children in early childhood development programmes…";

function SummarizePage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [text, setText] = useState("");
  const [source, setSource] = useState("English");
  const [length, setLength] = useState("medium");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");

  const handle = async () => {
    if (text.trim().length < 30) {
      toast.error("Please paste more text to summarize");
      return;
    }
    setLoading(true);
    try {
      const result = await api.post<{ dbId: string }>("/documents/summarize", {
        text: text.trim(),
        sourceLanguage: source,
        targetLanguage: source,
        action: "summarize",
        summaryLength: length,
      });

      setOverlayMessage("Generating summary...");
      setOverlayOpen(true);

      try {
        await waitForDocument(result.dbId);
        toast.success("Summary generated successfully");
        navigate(getPostProcessRoute(role, result.dbId));
      } catch (pollErr: any) {
        toast.error(pollErr?.message || "Processing failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Summarization request failed");
    } finally {
      setLoading(false);
      setOverlayOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Summarize Text</h1>
        <p className="text-muted-foreground">Enter or paste long text and generate a concise AI summary.</p>
      </div>

      <Card className="w-full">
        <CardHeader><CardTitle>Input</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Source language</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Summary length</Label>
              <RadioGroup value={length} onValueChange={setLength} className="mt-2 grid grid-cols-3 gap-1.5">
                {["short", "medium", "detailed"].map((l) => (
                  <label key={l} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border p-2 text-xs capitalize hover:bg-muted/50">
                    <RadioGroupItem value={l} /> {l}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste your text here"
            className="min-h-[320px] resize-none"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{text.length} characters</span>
            <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE)}>Try sample</Button>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={handle} disabled={loading} size="lg">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : "Generate Summary"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <ProcessingOverlay open={overlayOpen} message={overlayMessage} />
    </div>
  );
}
