import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { PLATFORM_LANGUAGES, type PlatformLanguage } from "@/lib/i18n";

type LanguageSelectorProps = {
  className?: string;
  triggerClassName?: string;
};

export function LanguageSelector({ className, triggerClassName }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={className}>
      <Select value={language} onValueChange={(value) => setLanguage(value as PlatformLanguage)}>
        <SelectTrigger className={triggerClassName ?? "w-[150px] gap-2"} aria-label={t("language.label")}>
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
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
    </div>
  );
}
