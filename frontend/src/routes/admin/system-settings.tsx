import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { PLATFORM_LANGUAGES, type PlatformLanguage } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/system-settings")({
  head: () => ({ meta: [{ title: "System Settings · GovLingua AI" }] }),
  component: AdminSystemSettings,
});

const translateLanguage = (langName: string, t: any) => {
  if (langName === "Kinyarwanda") return t("languages.kinyarwanda.title");
  if (langName === "English") return t("languages.english.title");
  if (langName === "French") return t("languages.french.title");
  return langName;
};

function SettingToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="pr-4">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function AdminSystemSettings() {
  const { t, language, setLanguage } = useLanguage();
  const [orgName, setOrgName] = useState("MINALOC");
  const [outputLanguage, setOutputLanguage] = useState("Kinyarwanda");
  const [passwordRequirements, setPasswordRequirements] = useState("strong");
  const [docProcessedAlerts, setDocProcessedAlerts] = useState(true);
  const [validationAlerts, setValidationAlerts] = useState(true);
  const [userRegistrationAlerts, setUserRegistrationAlerts] = useState(true);

  const handleSave = () => {
    toast.success(t("admin.settings.configSaved"), {
      description: t("admin.settings.configSavedDesc"),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("admin.settings.title")}</h1>
        <p className="text-muted-foreground">
          {t("admin.settings.description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("admin.settings.generalSettings")}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("admin.settings.generalDesc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="org-name">{t("admin.settings.orgName")}</Label>
              <Input
                id="org-name"
                className="mt-2"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div>
              <Label>{t("admin.settings.defaultLanguage")}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as PlatformLanguage)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_LANGUAGES.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("admin.settings.defaultLanguageHint")}
              </p>
            </div>
            <div>
              <Label>{t("admin.settings.defaultOutputLanguage")}</Label>
              <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {translateLanguage(lang, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("admin.settings.defaultOutputLanguageHint")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("admin.settings.securitySettings")}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("admin.settings.securityDesc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>{t("admin.settings.passwordRequirements")}</Label>
              <Select value={passwordRequirements} onValueChange={setPasswordRequirements}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{t("admin.settings.pwd.standard")}</SelectItem>
                  <SelectItem value="strong">{t("admin.settings.pwd.strong")}</SelectItem>
                  <SelectItem value="government">{t("admin.settings.pwd.government")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("admin.settings.pwdHint")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("admin.settings.notificationSettings")}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("admin.settings.notificationsDesc")}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SettingToggle
              label={t("admin.settings.docProcessed")}
              hint={t("admin.settings.docProcessedHint")}
              checked={docProcessedAlerts}
              onChange={setDocProcessedAlerts}
            />
            <SettingToggle
              label={t("admin.settings.validation")}
              hint={t("admin.settings.validationHint")}
              checked={validationAlerts}
              onChange={setValidationAlerts}
            />
            <SettingToggle
              label={t("admin.settings.userRegistration")}
              hint={t("admin.settings.userRegistrationHint")}
              checked={userRegistrationAlerts}
              onChange={setUserRegistrationAlerts}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-full px-6 py-2.5 shadow-md cursor-pointer animate-fade-in"
        >
          {t("admin.settings.saveConfig")}
        </Button>
      </div>
    </div>
  );
}
