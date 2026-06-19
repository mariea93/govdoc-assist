import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LANGUAGES } from "@/lib/mock-data";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { getRoleLabel } from "@/lib/user-accounts";
import { PLATFORM_LANGUAGES, type PlatformLanguage } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · GovLingua AI" }] }),
  component: Settings,
});

function Settings() {
  const { session } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [length, setLength] = useState("medium");
  const [target, setTarget] = useState("Kinyarwanda");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="preferences">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">{t("settings.tab.preferences")}</TabsTrigger>
          <TabsTrigger value="profile">{t("settings.tab.profile")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.tab.security")}</TabsTrigger>
          <TabsTrigger value="organization">{t("settings.tab.organization")}</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.defaultPreferences")}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Row label={t("settings.interfaceLanguage")}>
                <Select value={language} onValueChange={(value) => setLanguage(value as PlatformLanguage)}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORM_LANGUAGES.map((option) => (
                      <SelectItem key={option.code} value={option.code}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.defaultSummaryLength")}>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">{t("settings.length.short")}</SelectItem>
                    <SelectItem value="medium">{t("settings.length.medium")}</SelectItem>
                    <SelectItem value="detailed">{t("settings.length.detailed")}</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.defaultTargetLanguage")}>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.emailNotifications")} hint={t("settings.emailNotificationsHint")}>
                <Switch defaultChecked />
              </Row>
              <div className="flex justify-end">
                <Button onClick={() => toast.success(t("settings.preferencesSaved"))}>{t("settings.saveChanges")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.tab.profile")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" defaultValue={session?.name ?? ""} readOnly />
                <Field label="Email" defaultValue={session?.email ?? ""} readOnly />
                <Field label="Role" defaultValue={session ? getRoleLabel(session.role) : ""} readOnly />
              </div>
              <p className="text-xs text-muted-foreground">
                Your role is assigned to your account and controls access across the platform.
              </p>
              <div className="flex justify-end"><Button onClick={() => toast.success("Profile updated")}>Update profile</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Current password" type="password" />
              <Field label="New password" type="password" />
              <Field label="Confirm new password" type="password" />
              <Row label="Two-factor authentication" hint="Add a second layer of security to your account.">
                <Switch />
              </Row>
              <div className="flex justify-end"><Button onClick={() => toast.success("Password updated")}>Update password</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Organization Name" defaultValue="MINALOC" />
                <Field label="Province" defaultValue="Kigali, RWANDA" />
                <Field label="Contact email" defaultValue="info@minaloc.gov.rw" />
              </div>
              <div className="flex justify-end"><Button onClick={() => toast.success("Organization saved")}>Save organization</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start justify-between gap-2 border-b py-3 last:border-0 sm:flex-row sm:items-center">
      <div>
        <div className="font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      {children}
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
