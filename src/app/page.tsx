import { prisma } from "@/lib/db/prisma";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    totalCarriers,
    carrierTiers,
    unreadAlerts,
    scheduledInspections,
    networksDetected,
    carriersWithGap,
    inspectionsCompleted,
    scoreGroups,
  ] = await Promise.all([
    prisma.carrier.count(),
    prisma.carrier.findMany({
      select: { complianceScores: { orderBy: { computedAt: "desc" }, take: 1, select: { riskTier: true } } },
    }),
    prisma.alert.count({ where: { isRead: false, isDismissed: false } }),
    prisma.inspection.count({ where: { status: "SCHEDULED" } }),
    prisma.ownershipNetwork.count(),
    prisma.alert.count({ where: { alertType: "FLEET_GAP_DETECTED", isDismissed: false } }),
    prisma.inspection.count({ where: { status: "COMPLETED", outcome: { not: null } } }),
    prisma.complianceScore.groupBy({ by: ["computedAt"], _count: { _all: true }, orderBy: { computedAt: "desc" } }),
  ]);

  const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const c of carrierTiers) {
    const tier = c.complianceScores[0]?.riskTier;
    if (tier) riskCounts[tier]++;
  }

  // /api/prediction/run scores every carrier in one batch, so its rows share
  // one computedAt timestamp; a single inspection-triggered rescore only
  // ever touches one carrier. That count tells the two apart without needing
  // a dedicated "last run" marker.
  const lastPredictionRun = scoreGroups.find((g) => g._count._all > 1);
  const inspectionsSinceLastPrediction = lastPredictionRun
    ? await prisma.inspection.count({
        where: { status: "COMPLETED", outcome: { not: null }, completedAt: { gt: lastPredictionRun.computedAt } },
      })
    : inspectionsCompleted;

  return {
    totalCarriers,
    riskCounts,
    unreadAlerts,
    scheduledInspections,
    networksDetected,
    carriersWithGap,
    inspectionsSinceLastPrediction,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <DashboardView stats={stats} />;
}
