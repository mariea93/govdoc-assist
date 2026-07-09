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
  const { language, setLanguage } = useLanguage();
  const [orgName, setOrgName] = useState("MINALOC");
  const [outputLanguage, setOutputLanguage] = useState("Kinyarwanda");
  const [passwordRequirements, setPasswordRequirements] = useState("strong");
  const [docProcessedAlerts, setDocProcessedAlerts] = useState(true);
  const [validationAlerts, setValidationAlerts] = useState(true);
  const [userRegistrationAlerts, setUserRegistrationAlerts] = useState(true);

  const handleSave = () => {
    toast.success("Configurations saved", {
      description: "Global system settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure global configurations, security settings, and notifications.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">General Settings</CardTitle>
            <p className="text-xs text-muted-foreground">
              Organization identity and default language preferences for the platform.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                className="mt-2"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div>
              <Label>Default Language</Label>
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
                Default interface language for new users and public pages.
              </p>
            </div>
            <div>
              <Label>Default Document Output Language</Label>
              <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                Preferred language for summaries and translations by default.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">Security Settings</CardTitle>
            <p className="text-xs text-muted-foreground">
              Access controls and authentication requirements for government accounts.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Password Requirements</Label>
              <Select value={passwordRequirements} onValueChange={setPasswordRequirements}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (8+ characters)</SelectItem>
                  <SelectItem value="strong">Strong (12+ with symbols)</SelectItem>
                  <SelectItem value="government">Government-grade (16+ with rotation)</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                Minimum complexity enforced for all user accounts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Notification Settings</CardTitle>
            <p className="text-xs text-muted-foreground">
              In-app alerts for administrators and platform activity.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SettingToggle
              label="Document Processed Alerts"
              hint="Notify when document processing completes."
              checked={docProcessedAlerts}
              onChange={setDocProcessedAlerts}
            />
            <SettingToggle
              label="Validation Alerts"
              hint="Notify when outputs are approved or rejected."
              checked={validationAlerts}
              onChange={setValidationAlerts}
            />
            <SettingToggle
              label="User Registration Alerts"
              hint="Notify admins when new users register or are invited."
              checked={userRegistrationAlerts}
              onChange={setUserRegistrationAlerts}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-full px-6 py-2.5 shadow-md"
        >
          Save Configurations
        </Button>
      </div>
    </div>
  );
}
