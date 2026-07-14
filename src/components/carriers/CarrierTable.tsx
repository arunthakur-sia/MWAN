"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useCarriers } from "@/hooks/useCarriers";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function CarrierTable() {
  const [search, setSearch] = useState("");
  const [riskTier, setRiskTier] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;
  const { t } = useLocale();

  const RISK_FILTERS = [
    { value: "", label: t("common.all") },
    { value: "HIGH", label: t("common.riskHigh") },
    { value: "MEDIUM", label: t("common.riskMedium") },
    { value: "LOW", label: t("common.riskLow") },
  ];

  const { data, isLoading } = useCarriers({ page, limit, riskTier: riskTier || undefined, search: search || undefined });
  const carriers = data?.carriers ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("carriers.searchPlaceholder")}
            className="w-full ps-9 pe-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-mwan-green/30"
          />
        </div>
        <div className="flex gap-1">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setRiskTier(f.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                riskTier === f.value
                  ? "bg-mwan-green/10 text-mwan-green border-mwan-green/20"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-mwan-charcoal text-xs uppercase tracking-wide">
              <th className="text-start px-4 py-3 font-medium">{t("carriers.company")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("carriers.licenseNumber")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("carriers.declared")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("carriers.actual")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("carriers.gap")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("carriers.score")}</th>
              <th className="text-start px-4 py-3 font-medium">{t("carriers.risk")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {t("common.loading")}
                </td>
              </tr>
            )}
            {!isLoading && carriers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {t("common.noResults")}
                </td>
              </tr>
            )}
            {carriers.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-mwan-green/5">
                <td className="px-4 py-3">
                  <Link href={`/carriers/${c.id}`} className="font-medium text-mwan-charcoal hover:text-mwan-green">
                    {c.companyName}
                  </Link>
                  <div className="text-xs text-gray-400">{c.city}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs" dir="ltr">
                  {c.licenseNumber}
                </td>
                <td className="px-4 py-3 font-mono" dir="ltr">
                  {c.declaredFleet}
                </td>
                <td className="px-4 py-3 font-mono" dir="ltr">
                  {c.actualFleet}
                </td>
                <td className="px-4 py-3 font-mono" dir="ltr">
                  <span className={c.fleetGap > 0 ? "text-risk-high font-semibold" : "text-gray-400"}>
                    {c.fleetGap > 0 ? `+${c.fleetGap}` : c.fleetGap}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono" dir="ltr">
                  {c.score ? c.score.overallScore.toFixed(0) : "—"}
                </td>
                <td className="px-4 py-3">{c.score ? <RiskBadge tier={c.score.riskTier} /> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
        <span dir="ltr">
          {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} {t("common.of")} {total}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            {t("common.previous")}
          </button>
          <button
            onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
            disabled={page * limit >= total}
            className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            {t("common.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
