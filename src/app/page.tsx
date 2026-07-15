import { prisma } from "@/lib/db/prisma";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

// Mirrors the ml-service /retrain gate (ml-service/app.py): retraining needs
// at least this many completed inspections with a recorded outcome.
const RETRAIN_THRESHOLD = 50;

async function getStats() {
  const [
    totalCarriers,
    carrierTiers,
    unreadAlerts,
    pendingInspections,
    networksDetected,
    carriersWithGap,
    inspectionsCompleted,
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
  ]);

  const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const c of carrierTiers) {
    const tier = c.complianceScores[0]?.riskTier;
    if (tier) riskCounts[tier]++;
  }

  return {
    totalCarriers,
    riskCounts,
    unreadAlerts,
    pendingInspections,
    networksDetected,
    carriersWithGap,
    inspectionsCompleted,
    inspectionsUntilRetrain: Math.max(0, RETRAIN_THRESHOLD - inspectionsCompleted),
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <DashboardView stats={stats} />;
}
