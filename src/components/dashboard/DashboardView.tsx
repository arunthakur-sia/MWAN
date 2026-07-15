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
  unreadAlerts: number;
  pendingInspections: number;
  networksDetected: number;
  carriersWithGap: number;
  declaredFleet: number;
  actualFleet: number;
  confirmedOutcomes: number;
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

      {/* PLACEMENT IS AN ARGUMENT, not a layout preference. The notice qualifies
          the MODEL's output, and it sits BELOW FleetGapCard on purpose: the
          fleet gap is arithmetic over two real registries and is explicitly NOT
          a prediction (see FleetGapCard's docblock). Putting the caveat above it
          would attach "this is a model guess" to the one number on the page that
          is measured — the exact confusion this banner exists to prevent.
          Below it, everything the copy calls "every score below" — the high-risk
          tile and the risk ring — really is downstream of the model. */}
      <ColdStartNotice confirmedOutcomes={stats.confirmedOutcomes} />

      {/* Six tiles become five. The fleetGapDetected tile is REMOVED:
          carriersWithGap is not a peer of these counts — it is the gap's own
          scope, and it now lives inside FleetGapCard as its caption. Rendering
          it twice would state the page's central finding as a throwaway tile
          next to "networks detected".
          Tone: exactly ONE tile is text-risk-high. tone="medium" is gone from
          unreadAlerts — an unread alert is not a medium-risk finding, it is an
          unread alert. */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label={t("dashboard.totalCarriers")} value={stats.totalCarriers} />
        <StatCard label={t("dashboard.highRisk")} value={stats.riskCounts.HIGH} tone="high" />
        <StatCard label={t("dashboard.pendingInspections")} value={stats.pendingInspections} />
        <StatCard label={t("dashboard.networksDetected")} value={stats.networksDetected} />
        <StatCard label={t("dashboard.unreadAlerts")} value={stats.unreadAlerts} />
      </div>

      {/* items-start: the default `stretch` forced the risk card to match
          RecentAlerts' height (6 alert rows), leaving a tall empty white void
          under three short bars. Each card should be as tall as its content. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
        <RiskDistributionChart
          high={stats.riskCounts.HIGH}
          medium={stats.riskCounts.MEDIUM}
          low={stats.riskCounts.LOW}
        />
        <RecentAlerts />
      </div>
    </div>
  );
}
