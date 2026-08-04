"use client";
import Link from "next/link";
import { useAlerts } from "@/hooks/useAlerts";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeAlert } from "@/lib/i18n/localizeAlert";

/**
 * THE ALIGNMENT BUG, and why every row started at a different x:
 * the row was `flex gap-3` with <RiskBadge> as the first child, and the badge
 * SHRINK-WRAPS ITS LABEL — "Medium" is wider than "Low". So the text column
 * began at badge-width + gap, which differed per row: names landed at 217px on
 * Medium rows and 166px on Low rows. Nothing was aligned to anything.
 *
 * BADGE_COL fixes the column, not the badge. RiskBadge stays intrinsic because
 * CarrierTable and the alerts page use it inline, where a fixed width would
 * leave a dead gap. A column is a property of THIS list, so it belongs here.
 *
 * w-20 (80px) is measured, not guessed: the widest label is "Medium" (~62px at
 * text-caption incl. px-2.5 padding), and Arabic "متوسط" is narrower. 80px
 * clears both without stranding the text column.
 */
const BADGE_COL = "flex w-20 shrink-0 justify-start";

export function RecentAlerts() {
  const { data, isLoading } = useAlerts({ unreadOnly: true });
  const { t, locale } = useLocale();
  const alerts = data?.alerts.slice(0, 6) ?? [];
  const unread = data?.alerts.length ?? 0;

  return (
    <Card>
      <CardHeader
        title={t("dashboard.recentAlerts")}
        meta={
          !isLoading && unread > 0 ? (
            <>
              <span dir="ltr" className="font-mono tabular-nums">
                {unread.toLocaleString("en-US")}
              </span>{" "}
              {t("dashboard.alertsUnread")}
            </>
          ) : undefined
        }
        action={
          /* forest, NOT green: green on white is 3.32:1 and fails AA. Forest is 9.93. */
          <Link href="/alerts" className="text-body text-forest hover:underline underline-offset-2">
            {t("common.viewAll")}
          </Link>
        }
      />

      {/* The skeleton mirrors the real row geometry — same badge column, same
          two-line body — so the panel does not jump when data lands. */}
      {isLoading && (
        <ul className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3 py-2.5">
              <span className={BADGE_COL}>
                <Skeleton className="h-5 w-14 rounded-control" />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && alerts.length === 0 && (
        <p className="pt-3 text-body text-ink-muted">{t("dashboard.noUnreadAlerts")}</p>
      )}

      {!isLoading && alerts.length > 0 && (
        <ul className="divide-y divide-border">
          {alerts.map((a) => {
            const localized = localizeAlert(a, locale);
            return (
              <li key={a.id} className="flex items-start gap-3 py-2.5">
                {/* pt-0.5 optically centres the badge against the first line of
                    the name rather than its box top. */}
                <span className={`${BADGE_COL} pt-0.5`}>
                  <RiskBadge tier={a.severity} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/carriers/${a.carrierId}`}
                    className="block truncate text-body font-medium text-ink hover:text-forest"
                  >
                    {/* <bdi> isolates the company name: it is Arabic DATA that
                        renders inside an English UI when locale=en, and without
                        isolation the bidi algorithm lets it reorder against the
                        surrounding run. bdi scopes the direction to the name. */}
                    <bdi>{a.companyName}</bdi>
                  </Link>
                  <p className="truncate text-caption text-ink-muted">{localized.title}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
