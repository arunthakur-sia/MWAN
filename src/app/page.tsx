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
    scheduledInspections,
    networksDetected,
    carriersWithGap,
    declaredFleetAgg,
    actualFleet,
    confirmedOutcomes,
    // $transaction([...]) — NOT Promise.all. This is a connection-pool fix, not a
    // transactional-semantics one, and it is deliberately KEPT through this merge:
    // origin/main still had Promise.all because it branched before the fix, and
    // taking their side here would have silently reintroduced a bug that 500'd
    // this exact page.
    //
    // Promise.all fires every query CONCURRENTLY, so this one page demanded ~10
    // simultaneous connections in a single burst. DATABASE_URL sets
    // connection_limit=10 against a SESSION-MODE pooler capped at pool_size=15,
    // and the ML service holds its own psycopg2 connections on that same pool —
    // so the burst reliably tipped it over with
    // "FATAL: (EMAXCONNSESSION) max clients reached", and / was the only page
    // that 500'd because it is the only one doing server-side Prisma fan-out.
    // (Single-query API routes kept returning 200 throughout, which is what made
    // this look like flaky infrastructure rather than a real bug.)
    //
    // $transaction with an array runs them SEQUENTIALLY on ONE connection: N
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
    // ONE query, two consumers. This landed twice in the merge — as
    // `confirmedOutcomes` (ColdStartNotice's counter) and as `inspectionsCompleted`
    // (the fallback for inspectionsSinceLastPrediction) — with byte-identical
    // where-clauses under two names. It is a deliberate transcription of the
    // retrain gate at ml-service/app.py:318-324:
    //   SELECT COUNT(*) FROM "Inspection"
    //   WHERE status = 'COMPLETED' AND outcome IS NOT NULL
    // Both predicates matter: `outcome IS NOT NULL` is what makes an inspection a
    // usable training row, and `status='COMPLETED'` is what the service enforces.
    prisma.inspection.count({ where: { status: "COMPLETED", outcome: { not: null } } }),
  ]);

  // groupBy sits OUTSIDE the transaction for a type-system reason, not a
  // correctness one: Prisma's groupBy generic does not survive $transaction's
  // tuple inference — inside the array `_count` widens to `boolean | {...}` and
  // will not compile. origin/main only got clean inference because Promise.all
  // types each element independently.
  // This costs nothing that matters here. The point of the transaction is to cap
  // CONCURRENT connections, and an await placed after it is sequential — peak
  // concurrency is still 1, which is the whole fix.
  const scoreGroups = await prisma.complianceScore.groupBy({
    by: ["computedAt"],
    _count: true,
    orderBy: { computedAt: "desc" },
  });

  const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const c of carrierTiers) {
    const tier = c.complianceScores[0]?.riskTier;
    if (tier) riskCounts[tier]++;
  }

  // /api/prediction/run scores every carrier in one batch, so its rows share
  // one computedAt timestamp; a single inspection-triggered rescore only
  // ever touches one carrier. That count tells the two apart without needing
  // a dedicated "last run" marker.
  //
  // This query cannot join the batch above — it depends on the batch's own
  // result — so it is one extra connection AFTER the transaction closes, never
  // concurrent with it.
  const lastPredictionRun = scoreGroups.find((g) => g._count > 1);
  const inspectionsSinceLastPrediction = lastPredictionRun
    ? await prisma.inspection.count({
        where: { status: "COMPLETED", outcome: { not: null }, completedAt: { gt: lastPredictionRun.computedAt } },
      })
    : confirmedOutcomes;

  return {
    totalCarriers,
    riskCounts,
    unreadAlerts,
    scheduledInspections,
    networksDetected,
    carriersWithGap,
    // _sum returns null on an empty table
    declaredFleet: declaredFleetAgg._sum.declaredFleetSize ?? 0,
    actualFleet,
    confirmedOutcomes,
    inspectionsSinceLastPrediction,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <DashboardView stats={stats} />;
}
