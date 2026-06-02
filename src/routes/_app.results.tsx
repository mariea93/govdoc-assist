import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Download, FileText, RefreshCw, Save, FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/results")({
  head: () => ({ meta: [{ title: "Results · GovLingua AI" }] }),
  component: Results,
});

function Results() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Processing Results</h1>
          <p className="text-muted-foreground">Review your generated summary and translation.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/upload"><RefreshCw className="mr-2 h-4 w-4" /> Process Another</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Document" value="District_Budget_Q2.pdf" icon={<FileText className="h-4 w-4" />} />
          <Info label="Original language" value="English" />
          <Info label="Translated to" value="Kinyarwanda" />
          <div>
            <div className="text-xs text-muted-foreground">Quality score</div>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={94} className="h-2" />
              <span className="text-sm font-semibold">94%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <ResultPanel
          title="AI Summary"
          badge="English · Medium"
          body="The Q2 district budget allocates 38% to education, 24% to health, 18% to infrastructure, and 20% to general administration. Major investments include three new health posts in Nyamirambo and Nyarugenge, rehabilitation of 42 km of feeder roads, and expansion of early childhood education in 14 sectors. The administration projects 92% budget execution by end of quarter."
        />
        <ResultPanel
          title="Translation"
          badge="Kinyarwanda"
          body="Ingengo y'imari y'akarere yo mu gihembwe cya kabiri yashyize 38% mu burezi, 24% mu buzima, 18% mu kubaka ibikorwa remezo, na 20% mu micungire rusange. Bimwe mu byatewe imbaraga ni ukubaka ibigo bitatu by'ubuvuzi i Nyamirambo no muri Nyarugenge, gusana ibilometero 42 by'imihanda yo mu cyaro, no kwagura uburezi bw'abana bato mu mirenge 14."
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => toast.success("Copied to clipboard")}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
        <Button variant="outline" onClick={() => toast.success("Downloading PDF…")}>
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
        <Button variant="outline" onClick={() => toast.success("Downloading DOCX…")}>
          <FileDown className="mr-2 h-4 w-4" /> Download DOCX
        </Button>
        <Button onClick={() => toast.success("Saved to history")}>
          <Save className="mr-2 h-4 w-4" /> Save to History
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-sm font-semibold">{icon}{value}</div>
    </div>
  );
}

function ResultPanel({ title, badge, body }: { title: string; badge: string; body: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="outline">{badge}</Badge>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{body}</p>
      </CardContent>
    </Card>
  );
}
