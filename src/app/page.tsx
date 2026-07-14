import { prisma } from "@/lib/db/prisma";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalCarriers, carrierTiers, unreadAlerts, pendingInspections, networksDetected, carriersWithGap] =
    await Promise.all([
      prisma.carrier.count(),
      prisma.carrier.findMany({
        select: { complianceScores: { orderBy: { computedAt: "desc" }, take: 1, select: { riskTier: true } } },
      }),
      prisma.alert.count({ where: { isRead: false, isDismissed: false } }),
      prisma.inspection.count({ where: { status: "SCHEDULED" } }),
      prisma.ownershipNetwork.count(),
      prisma.alert.count({ where: { alertType: "FLEET_GAP_DETECTED", isDismissed: false } }),
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
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <DashboardView stats={stats} />;
}
