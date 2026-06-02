import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Download, Loader2, Sparkles } from "lucide-react";
import { LANGUAGES } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/summarize")({
  head: () => ({ meta: [{ title: "Summarize Text · GovLingua AI" }] }),
  component: SummarizePage,
});

const SAMPLE = "The district administration today released its quarterly report detailing progress on infrastructure, education, and healthcare initiatives across all sectors. Key highlights include the completion of three new health posts, the rehabilitation of 42 kilometres of feeder roads, and the enrolment of an additional 1,200 children in early childhood development programmes…";

function SummarizePage() {
  const [text, setText] = useState("");
  const [source, setSource] = useState("English");
  const [length, setLength] = useState("medium");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (text.trim().length < 30) {
      toast.error("Please paste more text to summarize");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setOutput(
        "Summary (" + length + "): The district released a quarterly report highlighting major progress in infrastructure (42 km of roads rehabilitated), healthcare (3 new health posts), and education (1,200+ new ECD enrolments). Officials commit to accelerating delivery in Q3 and strengthening community engagement."
      );
      setLoading(false);
    }, 1300);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Summarize Text</h1>
        <p className="text-muted-foreground">Paste long text and generate a concise AI summary.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
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
              placeholder={SAMPLE}
              className="min-h-[320px] resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{text.length} characters</span>
              <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE)}>Try sample</Button>
            </div>
            <Button onClick={handle} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Summary</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Summary</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" disabled={!output} onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" disabled={!output} onClick={() => toast.success("Download started")}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[420px] rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
              {output || <span className="text-muted-foreground">Your AI-generated summary will appear here.</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
