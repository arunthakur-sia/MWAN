"use client";
import { useState } from "react";
import Link from "next/link";
import { useInspections } from "@/hooks/useInspections";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function InspectionQueue() {
  const [status, setStatus] = useState("SCHEDULED");
  const { data, isLoading } = useInspections(status || undefined);
  const { t, locale } = useLocale();
  const inspections = data?.inspections ?? [];

  const STATUS_FILTERS = [
    { value: "SCHEDULED", label: t("inspections.filterScheduled") },
    { value: "COMPLETED", label: t("inspections.filterCompleted") },
    { value: "", label: t("common.all") },
  ];

  const STATUS_LABELS: Record<string, string> = {
    SCHEDULED: t("inspections.statusScheduled"),
    IN_PROGRESS: t("inspections.statusInProgress"),
    COMPLETED: t("inspections.statusCompleted"),
    CANCELLED: t("inspections.statusCancelled"),
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex gap-1 p-4 border-b border-gray-100">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              status === f.value
                ? "bg-mwan-green/10 text-mwan-green border-mwan-green/20"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-mwan-charcoal text-xs uppercase tracking-wide">
              <th className="text-start px-4 py-3 font-medium">{t("inspections.company")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("inspections.scheduledDate")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("inspections.inspector")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("inspections.status")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("inspections.score")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("inspections.risk")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {t("common.loading")}
                </td>
              </tr>
            )}
            {!isLoading && inspections.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {t("inspections.noInspections")}
                </td>
              </tr>
            )}
            {inspections.map((i) => (
              <tr key={i.id} className="border-t border-gray-100 hover:bg-mwan-green/5">
                <td className="px-4 py-3">
                  <Link href={`/inspections/${i.id}`} className="font-medium text-mwan-charcoal hover:text-mwan-green">
                    {i.companyName}
                  </Link>
                  <div className="text-xs text-gray-400 font-mono" dir="ltr">
                    {i.licenseNumber}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono" dir="ltr">
                  {new Date(i.scheduledDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                </td>
                <td className="px-4 py-3">{i.inspectorName ?? "—"}</td>
                <td className="px-4 py-3">{STATUS_LABELS[i.status]}</td>
                <td className="px-4 py-3 font-mono" dir="ltr">
                  {i.overallScore != null ? i.overallScore.toFixed(0) : "—"}
                </td>
                <td className="px-4 py-3">{i.riskTier ? <RiskBadge tier={i.riskTier} /> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
