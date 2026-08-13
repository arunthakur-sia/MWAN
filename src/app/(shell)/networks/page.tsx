"use client";
import { useState } from "react";
import Link from "next/link";
import { Network as NetworkIcon, Search } from "lucide-react";
import { useNetworks } from "@/hooks/useNetworks";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardInteractive } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

type GapFilter = "" | "under" | "over" | "correct";

export default function NetworksPage() {
  const [search, setSearch] = useState("");
  const [gapFilter, setGapFilter] = useState<GapFilter>("");
  const { data, isLoading } = useNetworks({ search: search || undefined, gapStatus: gapFilter || undefined });
  const { t } = useLocale();
  const networks = data?.networks ?? [];

  const GAP_FILTERS: { value: GapFilter; label: string }[] = [
    { value: "", label: t("common.all") },
    { value: "under", label: t("networks.underdeclared") },
    { value: "over", label: t("networks.overdeclared") },
    { value: "correct", label: t("networks.noGap") },
  ];

  return (
    <div className="space-y-3">
      <PageHeader title={t("networks.title")} subtitle={t("networks.subtitle")} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("networks.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <SegmentedControl name="gapStatus" value={gapFilter} onChange={setGapFilter} options={GAP_FILTERS} />
      </div>

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

      {!isLoading && networks.length === 0 && (
        <EmptyState>{search || gapFilter ? t("common.noResults") : t("networks.noNetworks")}</EmptyState>
      )}

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
                  <span className={n.combinedGap > 0 ? "text-risk-high" : "text-ink-muted"}>
                    {n.combinedGap > 0
                      ? t("networks.underdeclared")
                      : n.combinedGap < 0
                        ? t("networks.overdeclared")
                        : t("networks.noGap")}
                  </span>
                  <span
                    dir="ltr"
                    className={`font-mono font-semibold tabular-nums ${n.combinedGap > 0 ? "text-risk-high" : "text-ink-muted"}`}
                  >
                    {Math.abs(n.combinedGap).toLocaleString("en-US")}{" "}
                    {Math.abs(n.combinedGap) === 1 ? t("networks.vehicle") : t("networks.vehicles")}
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
