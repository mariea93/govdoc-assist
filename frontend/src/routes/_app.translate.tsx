import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_app/translate")({
  head: () => ({ meta: [{ title: "Translate Text · GovLingua AI" }] }),
  component: TranslatePage,
});

function TranslatePage() {
  const [source, setSource] = useState("English");
  const [target, setTarget] = useState("Kinyarwanda");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

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
      const result = await api.post<any>("/documents/translate", {
        text: input.trim(),
        sourceLanguage: source,
        targetLanguage: target,
        action: "translate",
      });
      setOutput(`Translation submitted (${result.id}). Status: ${result.status}. The AI service will process this shortly.`);
      toast.success("Text submitted for translation");
    } catch (err: any) {
      toast.error(err?.message || "Translation request failed");
    } finally {
      setLoading(false);
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

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border">
              <div className="border-b px-3 py-2 text-xs font-semibold text-muted-foreground">{source}</div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste text…"
                className="min-h-[300px] resize-none border-0 focus-visible:ring-0"
              />
            </div>
            <div className="rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between border-b px-3 py-2 text-xs font-semibold text-muted-foreground">
                <span>{target}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!output} onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!output} onClick={() => toast.success("Download started")}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="min-h-[300px] whitespace-pre-wrap p-3 text-sm leading-relaxed">
                {output || <span className="text-muted-foreground">Translation will appear here.</span>}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={translate} disabled={loading} size="lg">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating…</> : "Translate"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
