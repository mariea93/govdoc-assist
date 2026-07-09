import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight, Copy, Download, Loader2 } from "lucide-react";
import { LANGUAGES } from "@/lib/mock-data";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { getPostProcessRoute } from "@/lib/post-process-nav";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { waitForDocument } from "@/lib/wait-for-document";

export const Route = createFileRoute("/_app/translate")({
  head: () => ({ meta: [{ title: "Translate Text · GovLingua AI" }] }),
  component: TranslatePage,
});

function TranslatePage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [source, setSource] = useState("English");
  const [target, setTarget] = useState("Kinyarwanda");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");

  const swap = () => {
    setSource(target);
    setTarget(source);
    setInput(output);
    setOutput(input);
  };

  const translate = async () => {
    if (!input.trim()) return toast.error("Enter text to translate");
    setLoading(true);
    try {
      const result = await api.post<{ dbId: string }>("/documents/translate", {
        text: input.trim(),
        sourceLanguage: source,
        targetLanguage: target,
        action: "translate",
      });

      setOverlayMessage("Translating...");
      setOverlayOpen(true);

      try {
        await waitForDocument(result.dbId);
        toast.success("Text translated successfully");
        navigate(getPostProcessRoute(role, result.dbId));
      } catch (pollErr: any) {
        toast.error(pollErr?.message || "Processing failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Translation request failed");
    } finally {
      setLoading(false);
      setOverlayOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Translate Text</h1>
        <p className="text-muted-foreground">Translate between Kinyarwanda, English and French.</p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center gap-3 md:flex-row">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="md:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={swap} aria-label="Swap languages">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="md:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="mt-5">
            <div className="rounded-lg border w-full">
              <div className="border-b px-3 py-2 text-xs font-semibold text-muted-foreground">{source}</div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste text…"
                className="min-h-[300px] resize-none border-0 focus-visible:ring-0 w-full"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={translate} disabled={loading} size="lg">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating…</> : "Translate"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <ProcessingOverlay open={overlayOpen} message={overlayMessage} />
    </div>
  );
}
