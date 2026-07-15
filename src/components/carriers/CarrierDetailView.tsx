"use client";
import Link from "next/link";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { ComplianceScore } from "@/components/carriers/ComplianceScore";
import { FleetTimeline } from "@/components/carriers/FleetTimeline";
import { ScheduleInspectionButton } from "@/components/carriers/ScheduleInspectionButton";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader, BackLink } from "@/components/ui/PageHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeAlert } from "@/lib/i18n/localizeAlert";

export interface CarrierDetailData {
  id: string;
  companyName: string;
  licenseNumber: string;
  serviceType: string;
  city: string | null;
  region: string | null;
  licenseStatus: string;
  declaredFleetSize: number;
  actualFleet: number;
  score: {
    overallScore: number;
    riskTier: "HIGH" | "MEDIUM" | "LOW";
    topFactor1: string;
    topFactor2: string;
    topFactor3: string;
    predictionConfidence: number;
  } | null;
  registry: {
    legalForm: string | null;
    shareholders: { id: string; name: string; ownershipPct: number }[];
    directors: { id: string; name: string; position: string }[];
  } | null;
  networkMembers: { id: string; networkId: string; primaryOwnerName: string; memberCount: number }[];
  inspections: { id: string; scheduledDate: string; outcome: string | null; status: string }[];
  alerts: {
    id: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    title: string;
    description: string;
    titleEn: string;
    descriptionEn: string;
  }[];
}

export function CarrierDetailView({ data }: { data: CarrierDetailData }) {
  const { t, locale } = useLocale();
  const fleetGap = data.actualFleet - data.declaredFleetSize;
  const fleetGapPct = data.actualFleet > 0 ? (fleetGap / data.actualFleet) * 100 : 0;
  const factorValues = {
    fleet_gap: fleetGap > 0 ? `+${fleetGap}` : String(fleetGap),
    fleet_gap_pct: `${fleetGapPct > 0 ? "+" : ""}${fleetGapPct.toFixed(1)}%`,
  };

  return (
    <div className="space-y-3">
      <PageHeader
        /* <bdi> isolates the Arabic company name inside a possibly-English UI. */
        title={<bdi>{data.companyName}</bdi>}
        back={
          <Link href="/carriers">
            <BackLink>{t("carrierDetail.back")}</BackLink>
          </Link>
        }
        meta={
          <>
            <span dir="ltr" className="font-mono tabular-nums">
              {data.licenseNumber}
            </span>
            <span aria-hidden="true">·</span>
            <span>{data.serviceType}</span>
            <span aria-hidden="true">·</span>
            <span>
              {data.city}
              {data.city && data.region ? "، " : ""}
              {data.region}
            </span>
            {data.score && <RiskBadge tier={data.score.riskTier} />}
          </>
        }
        action={<ScheduleInspectionButton carrierId={data.id} />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label={t("carrierDetail.declaredFleet")} value={data.declaredFleetSize} />
        <StatCard label={t("carrierDetail.actualFleet")} value={data.actualFleet} />
        <StatCard
          label={t("carrierDetail.gap")}
          value={fleetGap > 0 ? `+${fleetGap}` : fleetGap}
          tone={fleetGap > 0 ? "high" : "default"}
        />
        <StatCard label={t("carrierDetail.licenseStatus")} value={data.licenseStatus} />
      </div>

      {data.score ? (
        <ComplianceScore
          score={data.score.overallScore}
          riskTier={data.score.riskTier}
          factors={[data.score.topFactor1, data.score.topFactor2, data.score.topFactor3]}
          factorValues={factorValues}
          confidence={data.score.predictionConfidence}
        />
      ) : (
        <Card>
          <p className="text-body text-ink-muted">{t("carrierDetail.noScoreYet")}</p>
        </Card>
      )}

      <FleetTimeline carrierId={data.id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader title={t("carrierDetail.ownership")} />
          <div className="pt-4">
            {data.registry ? (
              <div className="space-y-4 text-body">
                <div>
                  <p className="text-caption text-ink-muted mb-1">{t("carrierDetail.legalForm")}</p>
                  <p className="text-ink">{data.registry.legalForm}</p>
                </div>
                <div>
                  <p className="text-caption text-ink-muted mb-2">{t("carrierDetail.shareholders")}</p>
                  <ul className="space-y-1">
                    {data.registry.shareholders.map((s) => (
                      <li key={s.id} className="flex justify-between gap-2">
                        <bdi className="text-ink">{s.name}</bdi>
                        <span dir="ltr" className="font-mono tabular-nums text-ink-muted">
                          {s.ownershipPct}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-caption text-ink-muted mb-2">{t("carrierDetail.directors")}</p>
                  <ul className="space-y-1">
                    {data.registry.directors.map((d) => (
                      <li key={d.id} className="flex justify-between gap-2">
                        <bdi className="text-ink">{d.name}</bdi>
                        <span className="text-ink-muted">{d.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <EmptyState>{t("carrierDetail.noRegistry")}</EmptyState>
            )}

            {data.networkMembers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-caption text-ink-muted mb-2">{t("carrierDetail.networkMembership")}</p>
                {data.networkMembers.map((m) => (
                  <Link
                    key={m.id}
                    href={`/networks/${m.networkId}`}
                    className="block text-body text-forest hover:underline underline-offset-2"
                  >
                    <bdi>{m.primaryOwnerName}</bdi> —{" "}
                    <span dir="ltr" className="font-mono tabular-nums">
                      {m.memberCount}
                    </span>{" "}
                    {t("carrierDetail.networkLinkedCompanies")}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader title={t("carrierDetail.recentInspections")} />
            <div className="pt-4">
              {data.inspections.length === 0 && <EmptyState>{t("carrierDetail.noInspections")}</EmptyState>}
              <ul className="space-y-2">
                {data.inspections.map((i) => (
                  <li key={i.id} className="flex items-center justify-between text-body">
                    <Link href={`/inspections/${i.id}`} className="text-ink hover:text-forest">
                      {/* The ar-SA branch is DELIBERATE and must stay: it resolves to the
                          islamic-umalqura calendar, so Arabic readers see a Hijri date. That
                          is product behaviour, not formatting — this redesign is UI-only and
                          does not get to change what a date MEANS. (The en-US digit rule
                          applies to NUMBERS, which is a mono-font alignment concern.) */}
                      <span dir="ltr">
                        {new Date(i.scheduledDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                      </span>
                    </Link>
                    <span className="text-ink-muted">{i.outcome ?? i.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader title={t("carrierDetail.activeAlerts")} />
            <div className="pt-4">
              {data.alerts.length === 0 && <EmptyState>{t("carrierDetail.noActiveAlerts")}</EmptyState>}
              <ul className="space-y-2">
                {data.alerts.map((a) => {
                  const localized = localizeAlert(a, locale);
                  return (
                    <li key={a.id} className="flex items-start gap-2 text-body">
                      <RiskBadge tier={a.severity} />
                      <span className="text-ink">{localized.title}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
