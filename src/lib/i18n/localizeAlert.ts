import type { Locale } from "@/lib/i18n/translations";

export function localizeAlert<T extends { title: string; description: string; titleEn: string; descriptionEn: string }>(
  alert: T,
  locale: Locale,
) {
  return {
    title: locale === "en" ? alert.titleEn : alert.title,
    description: locale === "en" ? alert.descriptionEn : alert.description,
  };
}
