import { formatLocalizedDate, formatLocalizedDateTime } from "@/lib/i18n/formatDate";
import type { Locale } from "@/lib/i18n/translations";

interface Props {
  value: string | Date;
  locale: Locale;
  className?: string;
}

// Some engines' Intl (notably Safari/WebKit) can't render a numeric month for
// the Islamic calendar and silently fall back to a long month name no matter
// what format options are passed, so ar-locale text here can legitimately
// differ between server and client. suppressHydrationWarning is the React-
// sanctioned escape hatch for exactly this: a value known to differ for
// reasons outside the app's control, not a real bug to chase down.
export function LocalizedDate({ value, locale, className }: Props) {
  return (
    <span className={className} suppressHydrationWarning>
      {formatLocalizedDate(value, locale)}
    </span>
  );
}

export function LocalizedDateTime({ value, locale, className }: Props) {
  return (
    <span className={className} suppressHydrationWarning>
      {formatLocalizedDateTime(value, locale)}
    </span>
  );
}
