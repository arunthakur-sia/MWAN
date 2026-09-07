"use client";
import { useState } from "react";
import { LocalizedDate } from "@/components/shared/LocalizedDate";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface Props {
  issueDate: string;
  lastRenewalDate: string | null;
  endDate: string;
  licenseStatus: string;
}

function clampPct(n: number) {
  return Math.min(100, Math.max(0, n));
}

const DAY_MS = 1000 * 60 * 60 * 24;

export function LicenseValidityTimeline({ issueDate, lastRenewalDate, endDate, licenseStatus }: Props) {
  const { t, locale } = useLocale();

  // Truncated to the UTC day: SSR and client hydration run at slightly
  // different instants, and using the raw Date.now() from each produces two
  // different percentages for the same render, which is a hydration mismatch.
  // Day granularity is more than enough precision for this bar/day-count.
  const [now] = useState(() => Math.floor(Date.now() / DAY_MS) * DAY_MS);

  const issue = new Date(issueDate).getTime();
  const end = new Date(endDate).getTime();
  const renewal = lastRenewalDate ? new Date(lastRenewalDate).getTime() : null;
  const span = Math.max(end - issue, 1);

  const elapsedPct = clampPct(((now - issue) / span) * 100);
  const renewalPct = renewal != null ? clampPct(((renewal - issue) / span) * 100) : null;
  const daysToExpiry = Math.round((end - now) / DAY_MS);
  const isExpired = licenseStatus === "EXPIRED" || now > end;
  const isSuspended = licenseStatus === "SUSPENDED";

  const barTone = isExpired ? "bg-risk-high" : isSuspended ? "bg-risk-medium" : "bg-forest";
  const todayDotTone = isExpired ? "bg-risk-high" : isSuspended ? "bg-risk-medium" : "bg-forest";

  return (
    <Card>
      <CardHeader title={t("carrierDetail.licenseValidity")} />
      <div className="pt-4">
        <div className="relative h-2 rounded-full bg-surface-sunken">
          <div className={`absolute inset-y-0 start-0 rounded-full ${barTone}`} style={{ width: `${elapsedPct}%` }} />
          {renewalPct != null && (
            <div
              className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-surface bg-info"
              style={{ insetInlineStart: `${renewalPct}%`, transform: "translate(-50%, -50%)" }}
              // The date itself is already shown as text below (an attribute
              // can't use suppressHydrationWarning), so the native tooltip
              // only repeats the label — no locale-formatted date in an attribute.
              title={t("carrierDetail.lastRenewalDate")}
            />
          )}
          <div
            className={`absolute top-1/2 size-3 rounded-full border-2 border-surface ${todayDotTone}`}
            style={{ insetInlineStart: `${elapsedPct}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-caption">
          <div>
            <p className="text-ink-muted">{t("carrierDetail.issueDate")}</p>
            <p dir="ltr" className="mt-0.5 font-mono tabular-nums text-ink">
              <LocalizedDate value={issueDate} locale={locale} />
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-ink-muted">
              <span className="size-2 rounded-full bg-info" aria-hidden="true" />
              {t("carrierDetail.lastRenewalDate")}
            </p>
            <p dir="ltr" className="mt-0.5 font-mono tabular-nums text-ink">
              {lastRenewalDate ? <LocalizedDate value={lastRenewalDate} locale={locale} /> : t("carrierDetail.noRenewalYet")}
            </p>
          </div>
          <div>
            <p className="text-ink-muted">{t("carrierDetail.expiryDate")}</p>
            <p dir="ltr" className={`mt-0.5 font-mono tabular-nums ${isExpired ? "text-risk-high font-medium" : "text-ink"}`}>
              <LocalizedDate value={endDate} locale={locale} />
            </p>
          </div>
        </div>

        <p className={`mt-3 text-caption ${isExpired ? "text-risk-high" : isSuspended ? "text-risk-medium" : "text-ink-muted"}`}>
          {isSuspended && `${t("carrierDetail.licenseSuspendedNote")} · `}
          <span dir="ltr" className="font-mono tabular-nums">
            {Math.abs(daysToExpiry)}
          </span>{" "}
          {daysToExpiry >= 0 ? t("carrierDetail.daysUntilExpiry") : t("carrierDetail.daysSinceExpiry")}
        </p>
      </div>
    </Card>
  );
}
