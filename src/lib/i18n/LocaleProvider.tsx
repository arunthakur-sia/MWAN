"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translate, type Locale } from "@/lib/i18n/translations";

const LOCALE_STORAGE_KEY = "mwan-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function applyDocumentAttributes(locale: Locale) {
  document.documentElement.lang = locale === "ar" ? "ar" : "en";
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.classList.toggle("font-arabic", locale === "ar");
  document.documentElement.classList.toggle("font-sans", locale !== "ar");
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (stored === "ar" || stored === "en") {
      setLocaleState(stored);
      applyDocumentAttributes(stored);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    applyDocumentAttributes(next);
  }

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (key: string) => translate(locale, key) }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
