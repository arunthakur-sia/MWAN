"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LocalizedDateTime } from "@/components/shared/LocalizedDate";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeAlert } from "@/lib/i18n/localizeAlert";
import { localizeField } from "@/lib/i18n/localizeField";

/**
 * THE ALIGNMENT BUG (see RecentAlerts.tsx for the full account): the row was
 * `flex items-start gap-4` with <RiskBadge> as the first child, and the badge
 * SHRINK-WRAPS ITS LABEL — "Medium" is wider than "Low", so every row's text
 * column began at a different x. BADGE_COL fixes the COLUMN, not the badge:
 * RiskBadge stays intrinsic because CarrierTable uses it inline elsewhere.
 */
const BADGE_COL = "flex w-20 shrink-0 justify-start";

type SeverityFilter = "" | "HIGH" | "MEDIUM" | "LOW";
type ReadFilter = "" | "unread";

export default function AlertsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<SeverityFilter>("");
  const [readFilter, setReadFilter] = useState<ReadFilter>("");
  const { data, isLoading, mutate } = useAlerts({
    unreadOnly: readFilter === "unread",
    severity: severity || undefined,
    search: search || undefined,
  });
  const { t, locale } = useLocale();
  const alerts = data?.alerts ?? [];

  const SEVERITY_FILTERS: { value: SeverityFilter; label: string }[] = [
    { value: "", label: t("common.all") },
    { value: "HIGH", label: t("common.riskHigh") },
    { value: "MEDIUM", label: t("common.riskMedium") },
    { value: "LOW", label: t("common.riskLow") },
  ];

  const READ_FILTERS: { value: ReadFilter; label: string }[] = [
    { value: "", label: t("common.all") },
    { value: "unread", label: t("alerts.filterUnread") },
  ];

  async function markRead(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    mutate();
  }

  return (
    <div className="space-y-3">
      <PageHeader title={t("alerts.title")} subtitle={t("alerts.subtitle")} />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-border pb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("alerts.searchPlaceholder")}
              className="ps-9"
            />
          </div>
          <SegmentedControl name="severity" value={severity} onChange={setSeverity} options={SEVERITY_FILTERS} />
          <SegmentedControl name="read" value={readFilter} onChange={setReadFilter} options={READ_FILTERS} />
        </div>

        {/* Skeleton mirrors the real row geometry — same badge column, same
            two-line body — so the panel does not jump when data lands. */}
        {isLoading && (
          <ul className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-start gap-4 py-3">
                <span className={BADGE_COL}>
                  <Skeleton className="h-5 w-14 rounded-control" />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && alerts.length === 0 && (
          <EmptyState>{search || severity || readFilter ? t("common.noResults") : t("alerts.noAlerts")}</EmptyState>
        )}

        {!isLoading && alerts.length > 0 && (
          <ul className="divide-y divide-border">
            {alerts.map((a) => {
              const localized = localizeAlert(a, locale);
              return (
                <li key={a.id} className="flex items-start gap-4 py-3">
                  <span className={`${BADGE_COL} pt-0.5`}>
                    <RiskBadge tier={a.severity} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/carriers/${a.carrierId}`}
                      className={`block truncate text-body font-medium hover:text-forest ${
                        a.isRead ? "text-ink-muted" : "text-ink"
                      }`}
                    >
                      {/* <bdi> isolates the company name: it is Arabic DATA
                          rendering inside a possibly-English UI, and without
                          isolation the bidi algorithm lets it reorder against
                          the surrounding run. */}
                      <bdi>{localizeField(locale, a.companyName, a.companyNameEn)}</bdi>
                    </Link>
                    <p className="mt-0.5 truncate text-body text-ink-muted">{localized.title}</p>
                    <p className="mt-1 truncate text-caption text-ink-muted">{localized.description}</p>
                    <p className="mt-1 text-caption text-ink-muted" dir="ltr">
                      <LocalizedDateTime value={a.createdAt} locale={locale} />
                    </p>
                  </div>
                  {!a.isRead && (
                    <button
                      onClick={() => markRead(a.id)}
                      aria-label={`${t("alerts.markRead")} — ${localizeField(locale, a.companyName, a.companyNameEn)}`}
                      className="shrink-0 text-caption text-forest hover:underline underline-offset-2"
                    >
                      {t("alerts.markRead")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
