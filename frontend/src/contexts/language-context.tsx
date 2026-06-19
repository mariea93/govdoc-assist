import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  isPlatformLanguage,
  LANGUAGE_STORAGE_KEY,
  translate,
  type PlatformLanguage,
  type TranslationKey,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: PlatformLanguage;
  setLanguage: (language: PlatformLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): PlatformLanguage {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isPlatformLanguage(stored) ? stored : "en";
}

function applyDocumentLanguage(language: PlatformLanguage) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language === "rw" ? "rw" : language === "fr" ? "fr" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<PlatformLanguage>(() => {
    const initial = readStoredLanguage();
    applyDocumentLanguage(initial);
    return initial;
  });

  const setLanguage = useCallback((next: PlatformLanguage) => {
    setLanguageState(next);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    applyDocumentLanguage(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
