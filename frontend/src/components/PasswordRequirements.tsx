import { useLanguage } from "@/contexts/language-context";
import type { PasswordChecks } from "@/lib/password-validation";

export function PasswordRequirements({ checks }: { checks: PasswordChecks }) {
  const { t } = useLanguage();

  return (
    <div className="py-1">
      <div className="text-xs text-muted-foreground font-semibold mb-1">{t("auth.passwordRules")}</div>
      <ul className="text-xs space-y-1 text-muted-foreground pl-4 list-disc font-medium">
        <li className={checks.hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
          {t("auth.rule.length")}
        </li>
        <li className={checks.hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
          {t("auth.rule.upper")}
        </li>
        <li className={checks.hasNumber ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
          {t("auth.rule.number")}
        </li>
      </ul>
    </div>
  );
}
