import { Badge } from "@/components/ui/badge";
import type { UserAccount } from "@/lib/user-accounts";
import { useLanguage } from "@/contexts/language-context";

export function AccountStatusBadge({ status }: { status: UserAccount["status"] }) {
  const { t } = useLanguage();

  if (status === "Active") {
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-green) 18%, transparent)", color: "var(--brand-green)" }}>
        {t("status.active")}
      </Badge>
    );
  }
  if (status === "Invited") {
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-yellow) 18%, transparent)", color: "var(--brand-yellow)" }}>
        {t("status.invited")}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      {t("status.disabled")}
    </Badge>
  );
}
