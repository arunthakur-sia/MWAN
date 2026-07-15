import { prisma } from "@/lib/db/prisma";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

// The fleet gap is a MEASUREMENT, not a model output — arithmetic over two real
// registries, using the identical method the networks pipeline already trusts
// (src/app/api/networks/detect/route.ts:38-39: sum of Carrier.declaredFleetSize
// vs count of related Vehicle rows). Applied registry-wide, that makes the
// dashboard total reconcile with the networks page instead of quietly
// contradicting it.
//
// GroundTruthLabel has these fields per carrier and is one aggregate away. DO
// NOT USE IT. Per prisma/schema.prisma:310 it is seeded from a synthetic sheet
// and carries underDeclarationLabel — the ML TRAINING TARGET. Rendering the
// model's answer key as the registry's live gap, on a product whose premise is
// that risk tiers are predictions and not verdicts, would be circular.
async function getStats() {
  const [
    totalCarriers,
    carrierTiers,
    unreadAlerts,
    pendingInspections,
    networksDetected,
    carriersWithGap,
    declaredFleetAgg,
    actualFleet,
    confirmedOutcomes,
    // $transaction([...]) — NOT Promise.all. This is a connection-pool fix, not a
    // transactional-semantics one.
    //
    // Promise.all fires all 8 queries CONCURRENTLY, so this one page demanded 8
    // simultaneous connections in a single burst. DATABASE_URL sets
    // connection_limit=10 against a SESSION-MODE pooler capped at pool_size=15,
    // and the ML service holds its own psycopg2 connections on that same pool —
    // so the burst reliably tipped it over with
    // "FATAL: (EMAXCONNSESSION) max clients reached", and / was the only page
    // that 500'd because it is the only one doing server-side Prisma fan-out.
    // (Single-query API routes kept returning 200 throughout, which is what made
    // this look like flaky infrastructure rather than a real bug.)
    //
    // $transaction with an array runs them SEQUENTIALLY on ONE connection: 8
    // concurrent -> 1. These are independent reads for a dashboard, so their
    // total latency is what changes, not their meaning.
  ] = await prisma.$transaction([
    prisma.carrier.count(),
    prisma.carrier.findMany({
      select: { complianceScores: { orderBy: { computedAt: "desc" }, take: 1, select: { riskTier: true } } },
    }),
    prisma.alert.count({ where: { isRead: false, isDismissed: false } }),
    prisma.inspection.count({ where: { status: "SCHEDULED" } }),
    prisma.ownershipNetwork.count(),
    prisma.alert.count({ where: { alertType: "FLEET_GAP_DETECTED", isDismissed: false } }),
    prisma.carrier.aggregate({ _sum: { declaredFleetSize: true } }),
    // carrier-scoped, mirroring the pipeline's _count.vehicles, so orphan
    // vehicles cannot inflate the gap
    prisma.vehicle.count({ where: { carrier: { isNot: null } } }),
    // THE COLD-START COUNTER. This is a deliberate transcription of the retrain
    // gate at ml-service/app.py:318-324:
    //   SELECT COUNT(*) FROM "Inspection"
    //   WHERE status = 'COMPLETED' AND outcome IS NOT NULL
    // Both predicates matter and neither is redundant: `outcome IS NOT NULL` is
    // what makes an inspection a usable training row, and `status='COMPLETED'`
    // is what the service actually enforces. If this query and that gate ever
    // drift, the banner's bar fills toward a line the system does not use — so
    // it is written to match, not to be clever.
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
    // _sum returns null on an empty table
    declaredFleet: declaredFleetAgg._sum.declaredFleetSize ?? 0,
    actualFleet,
    confirmedOutcomes,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <DashboardView stats={stats} />;
}
