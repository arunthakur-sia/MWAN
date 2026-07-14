"use client";
import Link from "next/link";
import { Network as NetworkIcon } from "lucide-react";
import { useNetworks } from "@/hooks/useNetworks";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function NetworksPage() {
  const { data, isLoading } = useNetworks();
  const { t } = useLocale();
  const networks = data?.networks ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-mwan-charcoal">{t("networks.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("networks.subtitle")}</p>
      </div>

      {isLoading && <p className="text-sm text-gray-400">{t("common.loading")}</p>}
      {!isLoading && networks.length === 0 && <p className="text-sm text-gray-400">{t("networks.noNetworks")}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {networks.map((n) => (
          <Link
            key={n.id}
            href={`/networks/${n.id}`}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-mwan-green/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-mwan-green mb-2">
              <NetworkIcon size={18} />
              <span className="text-xs font-mono text-gray-400" dir="ltr">
                {n.networkName}
              </span>
            </div>
            <p className="font-medium text-mwan-charcoal">{n.primaryOwnerName}</p>
            <p className="text-xs text-gray-500 mt-1">
              {n.memberCount} {t("networks.linkedCompanies")}
            </p>
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">{t("networks.combinedGap")}</span>
              <span className={`font-mono font-semibold ${n.combinedGap > 0 ? "text-risk-high" : ""}`} dir="ltr">
                {n.combinedGap > 0 ? `+${n.combinedGap}` : n.combinedGap}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
