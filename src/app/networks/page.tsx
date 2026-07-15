"use client";
import Link from "next/link";
import { Network as NetworkIcon } from "lucide-react";
import { useNetworks } from "@/hooks/useNetworks";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardInteractive } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NetworksPage() {
  const { data, isLoading } = useNetworks();
  const { t } = useLocale();
  const networks = data?.networks ?? [];

  return (
    <div className="space-y-3">
      <PageHeader title={t("networks.title")} subtitle={t("networks.subtitle")} />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-card bg-surface p-5 shadow-card">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="mb-2 h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && networks.length === 0 && <EmptyState>{t("networks.noNetworks")}</EmptyState>}

      {!isLoading && networks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {networks.map((n) => (
            <Link key={n.id} href={`/networks/${n.id}`}>
              <CardInteractive>
                <div className="mb-2 flex items-center gap-2 text-forest">
                  <NetworkIcon size={18} />
                  <bdi>
                    <span className="font-mono text-caption text-ink-muted" dir="ltr">
                      {n.networkName}
                    </span>
                  </bdi>
                </div>
                <p className="text-body font-medium text-ink">
                  <bdi>{n.primaryOwnerName}</bdi>
                </p>
                <p className="mt-1 text-caption text-ink-muted">
                  <span dir="ltr" className="font-mono tabular-nums">
                    {n.memberCount.toLocaleString("en-US")}
                  </span>{" "}
                  {t("networks.linkedCompanies")}
                </p>
                <div className="mt-4 flex items-center justify-between text-body">
                  <span className="text-ink-muted">{t("networks.combinedGap")}</span>
                  <span
                    dir="ltr"
                    className={`font-mono font-semibold tabular-nums ${n.combinedGap > 0 ? "text-risk-high" : "text-ink-muted"}`}
                  >
                    {n.combinedGap > 0 ? `+${n.combinedGap.toLocaleString("en-US")}` : n.combinedGap.toLocaleString("en-US")}
                  </span>
                </div>
              </CardInteractive>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
