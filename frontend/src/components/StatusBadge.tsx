import { Badge } from "@/components/ui/badge";
import type { DocStatus } from "@/lib/mock-data";
import { useLanguage } from "@/contexts/language-context";

export function StatusBadge({ status }: { status: DocStatus | "Approved" | "Pending" | "Rejected" | "Improvement Requested" }) {
  const { t } = useLanguage();

  if (status === "Completed")
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-green) 18%, transparent)", color: "var(--brand-green)" }}>
        {t("status.completed")}
      </Badge>
    );
  if (status === "Processing")
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-blue) 18%, transparent)", color: "var(--brand-blue)" }}>
        {t("status.processing")}
      </Badge>
    );
  if (status === "Approved")
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-blue) 18%, transparent)", color: "var(--brand-blue)" }}>
        {t("status.approved")}
      </Badge>
    );
  if (status === "Pending")
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-yellow) 18%, transparent)", color: "var(--brand-yellow)" }}>
        {t("status.pending")}
      </Badge>
    );
  if (status === "Rejected")
    return (
      <Badge variant="destructive">
        {t("status.rejected")}
      </Badge>
    );
  if (status === "Improvement Requested")
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-yellow) 18%, transparent)", color: "var(--brand-yellow)" }}>
        {t("status.improvement")}
      </Badge>
    );
  return (
    <Badge variant="destructive">
      {t("status.failed")}
    </Badge>
  );
}
