"use client";
import Link from "next/link";
import { useAlerts } from "@/hooks/useAlerts";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeAlert } from "@/lib/i18n/localizeAlert";

export function RecentAlerts() {
  const { data, isLoading } = useAlerts(true);
  const { t, locale } = useLocale();
  const alerts = data?.alerts.slice(0, 6) ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t("dashboard.recentAlerts")}</h3>
        <Link href="/alerts" className="text-sm text-mwan-green hover:underline">
          {t("common.viewAll")}
        </Link>
      </div>
      {isLoading && <p className="text-sm text-gray-400">{t("common.loading")}</p>}
      {!isLoading && alerts.length === 0 && <p className="text-sm text-gray-400">{t("dashboard.noUnreadAlerts")}</p>}
      <ul className="space-y-3">
        {alerts.map((a) => {
          const localized = localizeAlert(a, locale);
          return (
            <li key={a.id} className="flex items-start gap-3">
              <RiskBadge tier={a.severity} />
              <div className="flex-1 min-w-0">
                <Link href={`/carriers/${a.carrierId}`} className="text-sm font-medium hover:text-mwan-green">
                  {a.companyName}
                </Link>
                <p className="text-xs text-gray-500 truncate">{localized.title}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
