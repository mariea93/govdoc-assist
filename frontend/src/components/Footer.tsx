import { Logo } from "@/components/Logo";
import { useLanguage } from "@/contexts/language-context";
import { Mail, MapPin } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-[#f8fafc] dark:bg-[#1a2430] py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  {t("nav.features")}
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-foreground transition-colors">
                  {t("nav.benefits")}
                </a>
              </li>
              <li>
                <a href="#languages" className="hover:text-foreground transition-colors">
                  {t("nav.languages")}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-foreground transition-colors">
                  {t("nav.about")}
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Languages */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              {t("footer.supportedLanguages")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Kinyarwanda</li>
              <li>English</li>
              <li>French</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:info@govlingua.rw" className="hover:text-foreground transition-colors">
                  info@govlingua.rw
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
