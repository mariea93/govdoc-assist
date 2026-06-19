import { Badge } from "@/components/ui/badge";
import type { UserAccount } from "@/lib/user-accounts";

export function AccountStatusBadge({ status }: { status: UserAccount["status"] }) {
  if (status === "Active") {
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-green) 18%, transparent)", color: "var(--brand-green)" }}>
        Active
      </Badge>
    );
  }
  if (status === "Invited") {
    return (
      <Badge style={{ backgroundColor: "color-mix(in oklab, var(--brand-yellow) 18%, transparent)", color: "var(--brand-yellow)" }}>
        Invited
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      Disabled
    </Badge>
  );
}
