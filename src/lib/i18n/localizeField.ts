import type { Locale } from "@/lib/i18n/translations";

/**
 * Picks the English sibling of a bilingual field when locale is "en", falling
 * back to the Arabic value if no translation was backfilled for that row.
 */
export function localizeField(locale: Locale, ar: string, en?: string | null): string {
  return locale === "en" && en ? en : ar;
}

/** Same as `localizeField` but for optional Arabic values (e.g. nullable city/region). */
export function localizeFieldOrNull(locale: Locale, ar: string | null, en?: string | null): string | null {
  if (ar == null) return null;
  return locale === "en" && en ? en : ar;
}
