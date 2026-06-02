import { Badge } from "@/components/ui/badge";
import type { DocStatus } from "@/lib/mock-data";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export function StatusBadge({ status }: { status: DocStatus }) {
  if (status === "Completed")
    return (
      <Badge className="gap-1" style={{ backgroundColor: "color-mix(in oklab, var(--brand-green) 18%, transparent)", color: "var(--brand-green)" }}>
        <CheckCircle2 className="h-3 w-3" /> Completed
      </Badge>
    );
  if (status === "Processing")
    return (
      <Badge className="gap-1" style={{ backgroundColor: "color-mix(in oklab, var(--brand-blue) 18%, transparent)", color: "var(--brand-blue)" }}>
        <Loader2 className="h-3 w-3 animate-spin" /> Processing
      </Badge>
    );
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" /> Failed
    </Badge>
  );
}
