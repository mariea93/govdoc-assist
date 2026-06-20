import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { api } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · GovLingua AI" }] }),
  component: Settings,
});

function Settings() {
  const { session } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);

  // Preferences
  const [length, setLength] = useState("medium");
  const [target, setTarget] = useState("Kinyarwanda");
  const [sourceLanguage, setSourceLanguage] = useState("Kinyarwanda");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [processingAlerts, setProcessingAlerts] = useState(true);

  // Profile
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Organization
  const [orgName, setOrgName] = useState("");
  const [orgDepartment, setOrgDepartment] = useState("");
  const [orgProvince, setOrgProvince] = useState("");
  const [orgDistrict, setOrgDistrict] = useState("");
  const [orgSector, setOrgSector] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");

  useEffect(() => {
    if (session) {
      setProfileName(session.name);
      setProfileEmail(session.email);
    }
  }, [session]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prefs, org] = await Promise.all([
          api.get<any>("/users/me/preferences"),
          api.get<any>("/users/me/organization"),
        ]);

        setLength(prefs.defaultSummaryLength || "medium");
        setTarget(prefs.defaultTargetLanguage || "Kinyarwanda");
        setSourceLanguage(prefs.defaultSourceLanguage || "Kinyarwanda");
        setEmailNotifications(prefs.emailNotifications ?? true);
        setProcessingAlerts(prefs.processingAlerts ?? true);

        setOrgName(org.organizationName || "");
        setOrgDepartment(org.department || "");
        setOrgProvince(org.province || "");
        setOrgDistrict(org.district || "");
        setOrgSector(org.sector || "");
        setOrgEmail(org.contactEmail || "");
        setOrgPhone(org.contactPhone || "");
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      await api.patch("/users/me/preferences", {
        interfaceLanguage: language,
        defaultSourceLanguage: sourceLanguage,
        defaultSummaryLength: length,
        defaultTargetLanguage: target,
        emailNotifications,
        processingAlerts,
      });
      toast.success(t("settings.preferencesSaved"));
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const updateProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Name is required");
      return;
    }
    setSavingProfile(true);
    try {
      await api.patch("/auth/profile", { name: profileName.trim() });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async () => {
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (!newPassword) {
      toast.error("New password is required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch("/auth/password", { currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const saveOrganization = async () => {
    setSavingOrg(true);
    try {
      await api.patch("/users/me/organization", {
        organizationName: orgName,
        department: orgDepartment,
        province: orgProvince,
        district: orgDistrict,
        sector: orgSector,
        contactEmail: orgEmail,
        contactPhone: orgPhone,
      });
      toast.success("Organization saved successfully");
    } catch {
      toast.error("Failed to save organization");
    } finally {
      setSavingOrg(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

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
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="detailed">{t("settings.length.detailed")}</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Default source language">
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.defaultTargetLanguage")}>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.emailNotifications")} hint={t("settings.emailNotificationsHint")}>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </Row>
              <Row label="Processing alerts" hint="Get notified when document processing completes.">
                <Switch checked={processingAlerts} onCheckedChange={setProcessingAlerts} />
              </Row>
              <div className="flex justify-end">
                <Button onClick={savePreferences} disabled={savingPrefs}>
                  {savingPrefs ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : t("settings.saveChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.tab.profile")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                <Field label="Email" type="email" value={profileEmail} readOnly disabled />
                <Field label="Role" defaultValue={session ? getRoleLabel(session.role) : ""} readOnly disabled />
                <Field label="Office" defaultValue={session?.office ?? ""} readOnly disabled />
              </div>
              <p className="text-xs text-muted-foreground">
                Email, role and office are managed by your administrator.
              </p>
              <div className="flex justify-end">
                <Button onClick={updateProfile} disabled={savingProfile}>
                  {savingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Update profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
              <Field label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password (min 8 characters)" />
              <Field label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
              <div className="flex justify-end">
                <Button onClick={updatePassword} disabled={savingPassword}>
                  {savingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. MINALOC" />
                <Field label="Department" value={orgDepartment} onChange={(e) => setOrgDepartment(e.target.value)} placeholder="e.g. IT Services" />
                <Field label="Province" value={orgProvince} onChange={(e) => setOrgProvince(e.target.value)} placeholder="e.g. Kigali City" />
                <Field label="District" value={orgDistrict} onChange={(e) => setOrgDistrict(e.target.value)} placeholder="e.g. Nyarugenge" />
                <Field label="Sector" value={orgSector} onChange={(e) => setOrgSector(e.target.value)} placeholder="e.g. Muhima" />
                <Field label="Contact Email" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder="e.g. info@org.gov.rw" />
                <Field label="Contact Phone" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} placeholder="e.g. +250 788 000 000" />
              </div>
              <div className="flex justify-end">
                <Button onClick={saveOrganization} disabled={savingOrg}>
                  {savingOrg ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save organization"}
                </Button>
              </div>
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
