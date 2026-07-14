"use client";
import Link from "next/link";
import { useAlerts } from "@/hooks/useAlerts";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeAlert } from "@/lib/i18n/localizeAlert";

export default function AlertsPage() {
  const { data, isLoading, mutate } = useAlerts();
  const { t, locale } = useLocale();
  const alerts = data?.alerts ?? [];

  async function markRead(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-mwan-charcoal">{t("alerts.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("alerts.subtitle")}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {isLoading && <p className="p-6 text-sm text-gray-400">{t("common.loading")}</p>}
        {!isLoading && alerts.length === 0 && <p className="p-6 text-sm text-gray-400">{t("alerts.noAlerts")}</p>}
        {alerts.map((a) => {
          const localized = localizeAlert(a, locale);
          return (
            <div key={a.id} className={`p-4 flex items-start gap-4 ${a.isRead ? "opacity-60" : ""}`}>
              <RiskBadge tier={a.severity} />
              <div className="flex-1 min-w-0">
                <Link href={`/carriers/${a.carrierId}`} className="font-medium hover:text-mwan-green">
                  {a.companyName}
                </Link>
                <p className="text-sm text-gray-600 mt-0.5">{localized.title}</p>
                <p className="text-xs text-gray-400 mt-1">{localized.description}</p>
                <p className="text-xs text-gray-400 mt-1" dir="ltr">
                  {new Date(a.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
                </p>
              </div>
              {!a.isRead && (
                <button onClick={() => markRead(a.id)} className="text-xs text-mwan-green hover:underline shrink-0">
                  {t("alerts.markRead")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
