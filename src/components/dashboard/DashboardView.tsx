"use client";
import { StatCard } from "@/components/shared/StatCard";
import { FleetGapCard } from "@/components/dashboard/FleetGapCard";
import { ColdStartNotice } from "@/components/dashboard/ColdStartNotice";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { RunPipelineButtons } from "@/components/dashboard/RunPipelineButtons";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export interface DashboardStats {
  totalCarriers: number;
  riskCounts: { HIGH: number; MEDIUM: number; LOW: number };
  unscoredByStatus: Record<string, number>;
  unreadAlerts: number;
  scheduledInspections: number;
  networksDetected: number;
  carriersWithGap: number;
  declaredFleet: number;
  actualFleet: number;
  inspectionsSinceLastPrediction: number;
}

/**
 * The regulator's question is "how big is the problem, and who do I inspect
 * next." Four stacked bands answer it in order: header, the measured gap, the
 * counts, then the model's read and the queue.
 *
 * The lucide imports are gone with StatCard's icon chip.
 */
export function DashboardView({ stats }: { stats: DashboardStats }) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      {/* This header was hand-rolled here first; PageHeader is that markup
          extracted verbatim, now shared with the other eight routes. The
          canvas-ink reasoning that used to live in this comment lives in the
          component, which is the only place it can protect every page. */}
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} action={<RunPipelineButtons />} />

      {/* The thesis. First thing read, and the only bold thing on the page. */}
      <FleetGapCard
        declaredFleet={stats.declaredFleet}
        actualFleet={stats.actualFleet}
        carriersWithGap={stats.carriersWithGap}
      />

      {/* Six tiles become five. The fleetGapDetected tile is REMOVED:
          carriersWithGap is not a peer of these counts — it is the gap's own
          scope, and it now lives inside FleetGapCard as its caption. Rendering
          it twice would state the page's central finding as a throwaway tile
          next to "networks detected".
          Tone: exactly ONE tile is text-risk-high. tone="medium" is gone from
          unreadAlerts — an unread alert is not a medium-risk finding, it is an
          unread alert. */}
      {/* Six tiles, not origin/main's seven. fleetGapDetected is REMOVED:
          carriersWithGap is not a peer of these counts — it is the gap's own
          scope, and it now lives inside FleetGapCard as its caption. Rendering
          it twice would state the page's central finding as a throwaway tile
          next to "networks detected".
          inspectionsSinceLastPrediction is KEPT — it is the merge's real
          addition, and it is the one tile here that is about the MODEL rather
          than the registry, which is why it sits last, nearest the ring.
          Tone: exactly ONE tile is text-risk-high. origin/main had tone="medium"
          on unreadAlerts and fleetGapDetected; an unread alert is not a
          medium-risk finding, it is an unread alert. The icon props are gone
          with StatCard's icon chip. */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label={t("dashboard.totalCarriers")} value={stats.totalCarriers} />
        <StatCard label={t("dashboard.highRisk")} value={stats.riskCounts.HIGH} tone="high" />
        <StatCard label={t("dashboard.scheduledInspections")} value={stats.scheduledInspections} />
        <StatCard label={t("dashboard.networksDetected")} value={stats.networksDetected} />
        <StatCard label={t("dashboard.unreadAlerts")} value={stats.unreadAlerts} />
        <StatCard
          label={t("dashboard.inspectionsSinceLastPrediction")}
          value={stats.inspectionsSinceLastPrediction}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskDistributionChart
          high={stats.riskCounts.HIGH}
          medium={stats.riskCounts.MEDIUM}
          low={stats.riskCounts.LOW}
          unscoredByStatus={stats.unscoredByStatus}
        />
        <RecentAlerts />
      </div>

      {/* Moved below the grid: the notice now qualifies everything above it —
          the tiles, the risk ring, and the alert list — rather than sitting
          between FleetGapCard and the tiles. */}
      <ColdStartNotice inspectionsSinceLastPrediction={stats.inspectionsSinceLastPrediction} />
    </div>
  );
}
