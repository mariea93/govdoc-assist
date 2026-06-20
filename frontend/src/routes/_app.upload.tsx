import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { LANGUAGES } from "@/lib/mock-data";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/upload")({
  head: () => ({ meta: [{ title: "Upload Document · GovLingua AI" }] }),
  component: UploadPage,
});

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [source, setSource] = useState("Kinyarwanda");
  const [target, setTarget] = useState("English");
  const [action, setAction] = useState("both");
  const [length, setLength] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleProcess = async () => {
    if (!file) {
      toast.error("Please upload a document first");
      return;
    }
    setProcessing(true);
    try {
      const actionMap: Record<string, string> = {
        summarize: "summarize",
        translate: "translate",
        both: "summarize_translate",
      };
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceLanguage", source);
      formData.append("targetLanguage", target);
      formData.append("action", actionMap[action] || "summarize_translate");

      await api.upload("/documents/upload", formData);
      toast.success("Document uploaded successfully");
      navigate({ to: "/history" });
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Upload Document</h1>
        <p className="text-muted-foreground">PDF, DOCX or TXT files for AI summarization and translation.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition ${
              dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex w-full max-w-md items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">Drag & drop your document</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse · PDF, DOCX, TXT up to 20 MB
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Languages</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
              <Label>Target language</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Processing options</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Action</Label>
              <RadioGroup value={action} onValueChange={setAction} className="mt-2 grid gap-2">
                {[
                  { v: "summarize", l: "Summarize only" },
                  { v: "translate", l: "Translate only" },
                  { v: "both", l: "Summarize and translate" },
                ].map((o) => (
                  <Fragment key={o.v}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm hover:bg-muted/50">
                      <RadioGroupItem value={o.v} /> {o.l}
                    </label>
                    {o.v === action && (action === "summarize" || action === "both") && (
                      <div className="pl-6 py-1 space-y-2">
                        <Label className="text-xs text-muted-foreground">Summary length</Label>
                        <RadioGroup value={length} onValueChange={setLength} className="grid grid-cols-3 gap-2">
                          {["short", "medium", "detailed"].map((l) => (
                            <label key={l} className="flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2 text-xs capitalize hover:bg-muted/50">
                              <RadioGroupItem value={l} /> {l}
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                  </Fragment>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleProcess} disabled={processing}>
          {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : "Process Document"}
        </Button>
      </div>
    </div>
  );
}
