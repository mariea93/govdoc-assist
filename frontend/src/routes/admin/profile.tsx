import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { translateRole } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "Profile · GovLingua AI" }] }),
  component: AdminProfile,
});

function AdminProfile() {
  const { session } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("settings.tab.profile")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">{t("settings.tab.profile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("settings.fullName")} defaultValue={session?.name ?? ""} readOnly />
            <Field label={t("settings.email")} defaultValue={session?.email ?? ""} readOnly />
            <Field
              label={t("settings.role")}
              defaultValue={session ? translateRole(session.role, t) : ""}
              readOnly
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("settings.profileNote")}</p>
          <div className="flex justify-end">
            <Button onClick={() => toast.success(t("settings.profileUpdated"))}>
              {t("settings.updateProfile")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-2" {...props} />
    </div>
  );
}
