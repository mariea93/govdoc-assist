import { Badge } from "@/components/ui/badge";
import type { DocStatus } from "@/lib/mock-data";

export function StatusBadge({ status }: { status: DocStatus | "Approved" }) {
  if (status === "Completed")
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-green) 18%, transparent)", color: "var(--brand-green)" }}>
        Completed
      </Badge>
    );
  if (status === "Processing")
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-blue) 18%, transparent)", color: "var(--brand-blue)" }}>
        Processing
      </Badge>
    );
  if (status === "Approved")
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-blue) 18%, transparent)", color: "var(--brand-blue)" }}>
        Approved
      </Badge>
    );
  return (
    <Badge variant="destructive">
      Failed
    </Badge>
  );
}
