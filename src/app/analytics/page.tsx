"use client";
import useSWR from "swr";
import { BarChart3, Target, Activity } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { RetrainButton } from "@/components/analytics/RetrainButton";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Metrics {
  active: {
    version: string;
    accuracy: number | null;
    precision: number | null;
    recall: number | null;
    f1Score: number | null;
    aucRoc: number | null;
    trainingSamples: number | null;
    trainedAt: string;
  } | null;
  history: { version: string; accuracy: number | null; trainedAt: string; isActive: boolean }[];
}

function pct(v: number | null) {
  return v == null ? "—" : `${(v * 100).toFixed(1)}%`;
}

export default function AnalyticsPage() {
  const { data, mutate } = useSWR<Metrics>("/api/ml/metrics", fetcher);
  const { t, locale } = useLocale();
  const active = data?.active;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-mwan-charcoal">{t("analytics.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("analytics.subtitle")}</p>
        </div>
        <RetrainButton onDone={() => mutate()} />
      </div>

      {!active && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-sm text-gray-400">
          {t("analytics.noModelYet")}
        </div>
      )}

      {active && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("analytics.accuracy")} value={pct(active.accuracy)} icon={Target} />
            <StatCard label={t("analytics.precision")} value={pct(active.precision)} icon={BarChart3} />
            <StatCard label={t("analytics.recall")} value={pct(active.recall)} icon={Activity} />
            <StatCard label={t("analytics.aucRoc")} value={pct(active.aucRoc)} icon={Target} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{t("analytics.versionHistory")}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-gray-400 text-start">
                  <th className="text-start py-2">{t("analytics.version")}</th>
                  <th className="text-start py-2">{t("analytics.accuracy")}</th>
                  <th className="text-start py-2">{t("analytics.trainedAt")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.history.map((h, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 font-mono" dir="ltr">
                      {h.version} {h.isActive && <span className="text-mwan-green">●</span>}
                    </td>
                    <td className="py-2 font-mono" dir="ltr">
                      {pct(h.accuracy)}
                    </td>
                    <td className="py-2 font-mono" dir="ltr">
                      {new Date(h.trainedAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
