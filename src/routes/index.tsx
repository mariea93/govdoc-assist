import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Languages,
  Zap,
  FileText,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GovLingua AI — Summarize & Translate Government Documents" },
      { name: "description", content: "AI-powered document summarization and translation between Kinyarwanda, English and French for Rwandan local government." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Logo />
          <nav className="hidden gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#benefits" className="hover:text-foreground">Benefits</a>
            <a href="#languages" className="hover:text-foreground">Languages</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/dashboard">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 10%, color-mix(in oklab, var(--brand-blue) 18%, transparent), transparent), radial-gradient(50% 50% at 90% 30%, color-mix(in oklab, var(--brand-green) 14%, transparent), transparent), radial-gradient(40% 40% at 70% 90%, color-mix(in oklab, var(--brand-yellow) 14%, transparent), transparent)",
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <Badge variant="secondary" className="mb-4 gap-1 bg-accent text-accent-foreground">
              <Sparkles className="h-3 w-3" /> Built for Local Government in Rwanda
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Summarize and translate <br />
              <span style={{ color: "var(--brand-blue)" }}>government</span>{" "}
              <span style={{ color: "var(--brand-green)" }}>documents</span>{" "}
              <span style={{ color: "var(--brand-yellow)" }}>instantly.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              GovLingua AI helps district and sector offices read, summarize and translate
              long reports, letters and communications between Kinyarwanda, English and
              French — in seconds.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/upload">Upload a document</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-success" /> Government-grade security</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" /> Trusted by 30+ district offices</span>
            </div>
          </div>

          {/* Illustration card */}
          <div className="relative">
            <Card className="relative overflow-hidden border-2 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <FileText className="h-4 w-4" /> District_Budget_Q2.pdf
                </div>
                <Badge style={{ backgroundColor: "var(--brand-green)", color: "white" }}>Processed</Badge>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-2 w-11/12 rounded bg-muted" />
                <div className="h-2 w-10/12 rounded bg-muted" />
                <div className="h-2 w-8/12 rounded bg-muted" />
              </div>
              <div className="my-5 flex items-center justify-center">
                <div
                  className="rounded-full p-3 shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--brand-blue), var(--brand-green))" }}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  AI Summary · Kinyarwanda
                </div>
                <p className="text-sm leading-relaxed">
                  Inyandiko igaragaza ingengo y'imari y'akarere ku gihembwe cya kabiri,
                  hibandwa cyane cyane ku burezi, ubuzima, no kubaka imihanda…
                </p>
                <div className="mt-3 flex gap-2 text-xs">
                  <Badge variant="outline">EN → RW</Badge>
                  <Badge variant="outline">98% accuracy</Badge>
                  <Badge variant="outline">2.4s</Badge>
                </div>
              </div>
            </Card>
            <div
              className="absolute -bottom-4 -right-4 -z-10 h-40 w-40 rounded-full blur-3xl"
              style={{ background: "color-mix(in oklab, var(--brand-yellow) 35%, transparent)" }}
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Built for public service</h2>
            <p className="mt-3 text-muted-foreground">
              Designed with district officers, translators and decision-makers in mind.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, title: "Save Time", desc: "Turn 30-page reports into clear summaries in under 10 seconds." , color: "var(--brand-blue)"},
              { icon: ShieldCheck, title: "Improve Accuracy", desc: "Reduce translation errors with AI tuned on official terminology.", color: "var(--brand-green)" },
              { icon: Languages, title: "Multilingual", desc: "Native support for Kinyarwanda, English and French.", color: "var(--brand-yellow)" },
              { icon: Zap, title: "Faster Decisions", desc: "Help leaders read, decide and act on documents the same day.", color: "var(--brand-blue)" },
            ].map((b) => (
              <Card key={b.title} className="p-6 transition hover:shadow-md">
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in oklab, ${b.color} 18%, transparent)`, color: b.color }}
                >
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Three languages, one platform</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Seamless summarization and translation across all official languages of Rwanda.
          </p>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-4">
            {[
              { label: "Kinyarwanda", color: "var(--brand-blue)" },
              { label: "English", color: "var(--brand-green)" },
              { label: "Français", color: "var(--brand-yellow)" },
            ].map((l) => (
              <div
                key={l.label}
                className="rounded-full border-2 px-6 py-3 text-base font-semibold"
                style={{ borderColor: l.color, color: l.color }}
              >
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="border-t bg-muted/40 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-2xl border bg-card px-6 py-12 text-center shadow-sm md:px-12">
          <Building2 className="h-10 w-10 text-primary" />
          <h2 className="font-display text-3xl font-bold md:text-4xl">Bring AI to your district office</h2>
          <p className="max-w-xl text-muted-foreground">
            Join the local government offices already using GovLingua AI to serve citizens faster.
          </p>
          <Button size="lg" asChild>
            <Link to="/dashboard">Open the dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row md:px-8">
          <Logo className="h-7 w-7" />
          <p>© 2026 GovLingua AI · Republic of Rwanda</p>
        </div>
      </footer>
    </div>
  );
}
