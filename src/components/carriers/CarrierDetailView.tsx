"use client";
import Link from "next/link";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { ComplianceScore } from "@/components/carriers/ComplianceScore";
import { FleetTimeline } from "@/components/carriers/FleetTimeline";
import { ScheduleInspectionButton } from "@/components/carriers/ScheduleInspectionButton";
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
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/carriers" className="text-sm text-mwan-green hover:underline">
            ← {t("carrierDetail.back")}
          </Link>
          <h1 className="text-2xl font-semibold text-mwan-charcoal mt-1">{data.companyName}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="font-mono" dir="ltr">
              {data.licenseNumber}
            </span>
            <span>·</span>
            <span>{data.serviceType}</span>
            <span>·</span>
            <span>
              {data.city}
              {data.city && data.region ? "، " : ""}
              {data.region}
            </span>
            {data.score && <RiskBadge tier={data.score.riskTier} />}
          </div>
        </div>
        <ScheduleInspectionButton carrierId={data.id} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("carrierDetail.declaredFleet")}</p>
          <p className="text-xl font-bold font-mono" dir="ltr">
            {data.declaredFleetSize}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("carrierDetail.actualFleet")}</p>
          <p className="text-xl font-bold font-mono" dir="ltr">
            {data.actualFleet}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("carrierDetail.gap")}</p>
          <p className={`text-xl font-bold font-mono ${fleetGap > 0 ? "text-risk-high" : ""}`} dir="ltr">
            {fleetGap > 0 ? `+${fleetGap}` : fleetGap}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("carrierDetail.licenseStatus")}</p>
          <p className="text-xl font-bold">{data.licenseStatus}</p>
        </div>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-sm text-gray-400">
          {t("carrierDetail.noScoreYet")}
        </div>
      )}

      <FleetTimeline carrierId={data.id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t("carrierDetail.ownership")}</h3>
          {data.registry ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">{t("carrierDetail.legalForm")}</p>
                <p>{data.registry.legalForm}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2">{t("carrierDetail.shareholders")}</p>
                <ul className="space-y-1">
                  {data.registry.shareholders.map((s) => (
                    <li key={s.id} className="flex justify-between">
                      <span>{s.name}</span>
                      <span className="font-mono text-gray-500" dir="ltr">
                        {s.ownershipPct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2">{t("carrierDetail.directors")}</p>
                <ul className="space-y-1">
                  {data.registry.directors.map((d) => (
                    <li key={d.id} className="flex justify-between">
                      <span>{d.name}</span>
                      <span className="text-gray-500">{d.position}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t("carrierDetail.noRegistry")}</p>
          )}

          {data.networkMembers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-xs mb-2">{t("carrierDetail.networkMembership")}</p>
              {data.networkMembers.map((m) => (
                <Link
                  key={m.id}
                  href={`/networks/${m.networkId}`}
                  className="block text-sm text-mwan-green hover:underline"
                >
                  {m.primaryOwnerName} — {m.memberCount} {t("carrierDetail.networkLinkedCompanies")}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t("carrierDetail.recentInspections")}</h3>
            {data.inspections.length === 0 && <p className="text-sm text-gray-400">{t("carrierDetail.noInspections")}</p>}
            <ul className="space-y-2">
              {data.inspections.map((i) => (
                <li key={i.id} className="flex items-center justify-between text-sm">
                  <Link href={`/inspections/${i.id}`} className="hover:text-mwan-green">
                    {new Date(i.scheduledDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                  </Link>
                  <span className="text-gray-500">{i.outcome ?? i.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t("carrierDetail.activeAlerts")}</h3>
            {data.alerts.length === 0 && <p className="text-sm text-gray-400">{t("carrierDetail.noActiveAlerts")}</p>}
            <ul className="space-y-2">
              {data.alerts.map((a) => {
                const localized = localizeAlert(a, locale);
                return (
                  <li key={a.id} className="flex items-start gap-2 text-sm">
                    <RiskBadge tier={a.severity} />
                    <span>{localized.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
