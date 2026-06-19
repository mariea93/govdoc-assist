import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/language-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GovLingua AI — Summarize & Translate Government Documents" },
      {
        name: "description",
        content:
          "AI-powered document summarization and translation between Kinyarwanda, English and French for Rwandan local government.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#163a5f]/10 selection:text-[#163a5f]">
      {/* Combined Header and Hero container with unified blue-gray bg and abstract shapes */}
      <div className="relative overflow-hidden bg-[#f4f6f9] dark:bg-[#151f2b]">
        {/* Soft abstract shapes */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -left-20 -top-20 h-[350px] w-[350px] rounded-full bg-[#163a5f]/8 dark:bg-[#3d6a94]/10 blur-[100px]" />
          <div className="absolute -right-20 top-20 h-[500px] w-[500px] rounded-full bg-[#2f6b4f]/6 dark:bg-[#2f6b4f]/8 blur-[120px]" />
          <div className="absolute left-[35%] top-[25%] h-[200px] w-[200px] rounded-full bg-[#c9a227]/5 dark:bg-[#c9a227]/6 blur-[80px]" />
        </div>

        {/* Nav */}
        <header className="sticky top-0 z-30 border-b border-gray-200/30 bg-transparent backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <Logo />
            <nav className="hidden gap-7 text-sm font-semibold text-muted-foreground md:flex">
              <a href="#features" className="hover:text-foreground transition-colors">
                {t("nav.features")}
              </a>
              <a href="#benefits" className="hover:text-foreground transition-colors">
                {t("nav.benefits")}
              </a>
              <a href="#languages" className="hover:text-foreground transition-colors">
                {t("nav.languages")}
              </a>
              <a href="#about" className="hover:text-foreground transition-colors">
                {t("nav.about")}
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <LanguageSelector triggerClassName="h-9 w-[130px] rounded-md border border-gray-200 bg-white hover:bg-slate-50 gap-2 text-foreground font-medium text-xs [&>span]:w-full" />
              <Link
                to="/sign-in"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.signIn")}
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-6 pb-16 md:grid-cols-2 md:px-8 md:pt-10 md:pb-24">
            <div className="animate-fade-in space-y-6">
              <h1 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-[#163a5f] dark:text-foreground sm:text-5xl lg:text-6xl max-w-xl">
                <span className="text-[#c9a227]">{t("hero.titleAi")}</span>{" "}
                <span className="text-[#2f6b4f]">{t("hero.titleDocs")}</span>{" "}
                {t("hero.titleGov")}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                {t("hero.description")}
              </p>

              {/* Oval Badges */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <span className="rounded-full bg-[#f1f5f9] px-4 py-1.5 text-xs font-semibold text-[#163a5f] dark:bg-[#243040] dark:text-[#a8b4c0]">
                  {t("hero.badge.languages")}
                </span>
                <span className="rounded-full bg-[#f1f5f9] px-4 py-1.5 text-xs font-semibold text-[#163a5f] dark:bg-[#243040] dark:text-[#a8b4c0]">
                  {t("hero.badge.aiPowered")}
                </span>
                <span className="rounded-full bg-[#f1f5f9] px-4 py-1.5 text-xs font-semibold text-[#163a5f] dark:bg-[#243040] dark:text-[#a8b4c0]">
                  {t("hero.badge.fast")}
                </span>
              </div>

              <div className="pt-2">
                <Button
                  size="lg"
                  className="bg-[#163a5f] hover:bg-[#163a5f]/90 text-white rounded-md px-6 py-3 font-semibold shadow-md text-sm transition-colors cursor-pointer"
                  asChild
                >
                  <Link to="/sign-in">{t("hero.uploadDocument")}</Link>
                </Button>
              </div>
            </div>

            {/* Dotted Rwanda map & Preview Card */}
            <div className="relative flex items-center justify-center p-4 animate-fade-in-delay-2">
              {/* Dotted Rwanda Map SVG Pattern Mask */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 -z-10 w-[85%] h-[85%] opacity-25">
                <svg
                  viewBox="0 0 300 300"
                  className="w-full h-full fill-[#163a5f] dark:fill-white text-[#163a5f] dark:text-white"
                >
                  <defs>
                    <pattern id="rwandaDots" width="8" height="8" patternUnits="userSpaceOnUse">
                      <circle cx="4" cy="4" r="1.3" className="fill-current" />
                    </pattern>
                    <mask id="rwandaMask">
                      <path
                        d="M 131 75 L 64 109 L 77 168 L 50 190 L 10 234 L 32 273 L 62 281 L 103 290 L 142 278 L 187 224 L 276 209 L 290 187 L 265 131 L 279 42 L 228 10 L 173 58 Z"
                        fill="white"
                      />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#rwandaDots)" mask="url(#rwandaMask)" />
                </svg>
              </div>

              {/* Preview Card */}
              <Card className="relative overflow-hidden border border-[#e2e8ee] p-6 shadow-xl w-full max-w-[420px] bg-white/95 backdrop-blur-sm dark:bg-[#1a2430]/95 rounded-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>District_Budget_Q2.pdf</span>
                  </div>
                  <span className="rounded-full bg-[#ebf7ed] px-3 py-1 text-[11px] font-semibold text-[#2f6b4f] dark:bg-[#2f6b4f]/20 dark:text-[#4d8a6a]">
                    {t("hero.preview.status")}
                  </span>
                </div>
                <div className="mb-4 space-y-1 text-xs text-muted-foreground font-medium">
                  <p>{t("hero.preview.docLanguage")}</p>
                  <p>{t("hero.preview.pages")}</p>
                  <p>{t("hero.preview.documentType")}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#fafafa]/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="mb-2">
                    <div className="text-xs font-bold text-[#163a5f] dark:text-foreground">
                      {t("hero.preview.summaryTitle")}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {t("hero.preview.summaryLanguage")}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/90">
                    Inyandiko igaragaza ingengo y'imari y'akarere ku gihembwe cya kabiri, hibandwa cyane
                    cyane ku burezi, ubuzima, no kubaka imihanda...
                  </p>
                  <div className="mt-3">
                    <span className="inline-block rounded border border-gray-200 bg-white px-2 py-0.5 text-[9px] font-bold text-muted-foreground dark:border-slate-800 dark:bg-slate-900">
                      {t("hero.preview.languagePair")}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>

      {/* Benefits */}
      <section id="benefits" className="border-t border-gray-200/20 dark:border-slate-800/20 py-16 bg-white dark:bg-[#121a22]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="font-display text-2xl font-extrabold text-[#163a5f] dark:text-foreground md:text-3xl">
              {t("benefits.title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("benefits.subtitle")}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Save Time */}
            <div className="rounded-xl border border-[#dce7f6] bg-[#f0f5fc] p-6 dark:bg-[#1a2430]/40 dark:border-[#244b74]/40">
              <h3 className="font-display text-base font-bold text-[#163a5f] dark:text-[#3d6a94]">
                {t("benefits.saveTime.title")}
              </h3>
              <p className="mt-2 text-sm text-[#163a5f]/80 dark:text-muted-foreground leading-relaxed">
                {t("benefits.saveTime.desc")}
              </p>
            </div>

            {/* Card 2: Improve Understanding */}
            <div className="rounded-xl border border-[#dcedf4] bg-[#f0f8f4] p-6 dark:bg-[#1a2430]/40 dark:border-[#2f6b4f]/40">
              <h3 className="font-display text-base font-bold text-[#2f6b4f] dark:text-[#4d8a6a]">
                {t("benefits.understanding.title")}
              </h3>
              <p className="mt-2 text-sm text-[#2f6b4f]/80 dark:text-muted-foreground leading-relaxed">
                {t("benefits.understanding.desc")}
              </p>
            </div>

            {/* Card 3: Multilingual Access */}
            <div className="rounded-xl border border-[#f6f2dc] bg-[#fbf9f0] p-6 dark:bg-[#1a2430]/40 dark:border-[#c9a227]/40">
              <h3 className="font-display text-base font-bold text-[#c9a227] dark:text-[#d4b44a]">
                {t("benefits.multilingual.title")}
              </h3>
              <p className="mt-2 text-sm text-[#c9a227]/80 dark:text-muted-foreground leading-relaxed">
                {t("benefits.multilingual.desc")}
              </p>
            </div>

            {/* Card 4: Better Communication */}
            <div className="rounded-xl border border-[#e6e2f6] bg-[#f4f3fb] p-6 dark:bg-[#1a2430]/40 dark:border-purple-900/20">
              <h3 className="font-display text-base font-bold text-[#5c2474] dark:text-purple-400">
                {t("benefits.communication.title")}
              </h3>
              <p className="mt-2 text-sm text-[#5c2474]/80 dark:text-muted-foreground leading-relaxed">
                {t("benefits.communication.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="py-16 bg-white dark:bg-[#121a22] border-t border-gray-200/20 dark:border-slate-800/20">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          <h2 className="font-display text-2xl font-extrabold text-[#163a5f] dark:text-foreground md:text-3xl">
            {t("languages.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {t("languages.subtitle")}
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            {/* Kinyarwanda */}
            <div className="rounded-xl border-2 border-[#163a5f]/40 p-6 text-center hover:border-[#163a5f] transition-all">
              <h3 className="font-display text-base font-bold text-[#163a5f] dark:text-[#3d6a94]">
                {t("languages.kinyarwanda.title")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {t("languages.kinyarwanda.desc")}
              </p>
            </div>

            {/* English */}
            <div className="rounded-xl border-2 border-[#2f6b4f]/40 p-6 text-center hover:border-[#2f6b4f] transition-all">
              <h3 className="font-display text-base font-bold text-[#2f6b4f] dark:text-[#4d8a6a]">
                {t("languages.english.title")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {t("languages.english.desc")}
              </p>
            </div>

            {/* French */}
            <div className="rounded-xl border-2 border-[#c9a227]/40 p-6 text-center hover:border-[#c9a227] transition-all">
              <h3 className="font-display text-base font-bold text-[#c9a227] dark:text-[#d4b44a]">
                {t("languages.french.title")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {t("languages.french.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 bg-white dark:bg-[#121a22] border-t border-gray-200/20 dark:border-slate-800/20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="rounded-2xl border border-border bg-[#fafbfc] dark:bg-[#1a2430] p-8 md:p-12 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              {/* Left info */}
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-extrabold text-[#163a5f] dark:text-foreground">
                  {t("cta.title")}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("cta.subtitle")}
                </p>
              </div>

              {/* Right key points */}
              <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 border-t lg:border-t-0 lg:border-l border-border pt-8 lg:pt-0 lg:pl-8">
                {/* AI Summarization */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {t("about.summarization.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("about.summarization.desc")}
                  </p>
                </div>
                {/* Translation */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {t("about.translation.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("about.translation.desc")}
                  </p>
                </div>
                {/* Accessibility */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {t("about.accessibility.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("about.accessibility.desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
