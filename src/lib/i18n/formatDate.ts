import type { Locale } from "@/lib/i18n/translations";

// Plain "ar-SA" resolves to whichever calendar the ICU implementation defaults
// to for that locale — Node (server) defaults to Gregorian, Chromium (client)
// defaults to Islamic Umalqura. Same locale string, two different calendars,
// so SSR and hydration render different text for the same date and React
// throws the tree away and re-renders on the client.
//
// Pinning the calendar with the `-u-ca-islamic-umalqura` extension AND fixing
// the numeric/format options makes every ICU implementation agree on the
// exact output. Arabic readers still see a Hijri date — that is deliberate
// product behaviour, not something this fixes away — it just makes the date
// deterministic instead of environment-dependent.
const AR_DATE_LOCALE = "ar-SA-u-ca-islamic-umalqura";

const DATE_OPTS: Intl.DateTimeFormatOptions = { year: "numeric", month: "numeric", day: "numeric" };
const DATE_TIME_OPTS: Intl.DateTimeFormatOptions = { ...DATE_OPTS, hour: "numeric", minute: "numeric" };

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

export function formatLocalizedDate(value: string | Date, locale: Locale): string {
  return toDate(value).toLocaleDateString(locale === "ar" ? AR_DATE_LOCALE : "en-US", DATE_OPTS);
}

export function formatLocalizedDateTime(value: string | Date, locale: Locale): string {
  return toDate(value).toLocaleString(locale === "ar" ? AR_DATE_LOCALE : "en-US", DATE_TIME_OPTS);
}
