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
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · GovLingua AI" }] }),
  component: Settings,
});

function Settings() {
  const [lang, setLang] = useState("English");
  const [length, setLength] = useState("medium");
  const [target, setTarget] = useState("Kinyarwanda");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences, profile and organization details.</p>
      </div>

      <Tabs defaultValue="preferences">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Default preferences</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Row label="Interface language">
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </Row>
              <Row label="Default summary length">
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Default target language">
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </Row>
              <Row label="Email notifications" hint="Receive emails when documents finish processing.">
                <Switch defaultChecked />
              </Row>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Preferences saved")}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" defaultValue="Uwase Mukamana" />
                <Field label="Title" defaultValue="District Officer" />
                <Field label="Email" defaultValue="uwase.m@kigali.gov.rw" />
                <Field label="Phone" defaultValue="+250 788 000 000" />
              </div>
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
                <Field label="Organization name" defaultValue="Kigali District Office" />
                <Field label="Province" defaultValue="Kigali City" />
                <Field label="District" defaultValue="Nyarugenge" />
                <Field label="Official contact" defaultValue="info@kigali.gov.rw" />
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
