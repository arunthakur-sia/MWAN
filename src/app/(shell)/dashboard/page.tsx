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
    scalarStats,
    carrierTiers,
    actualFleet,
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
    //
    // That said, sequential still means one network round-trip PER statement,
    // and DATABASE_URL is a pooler in ap-southeast-2 — every round-trip pays
    // full cross-region latency, and this is why "/" (and only "/") was slow to
    // navigate to: 9 statements here + a groupBy + a conditional count below
    // was ~11 round-trips on every single click. The 7 single-table scalar
    // reads below don't touch each other or the pool-count invariant above —
    // they're folded into ONE round-trip via a raw SQL query with subqueries,
    // still inside this same transaction/connection. carrierTiers (needs
    // per-carrier rows) and actualFleet (relation-filtered, per the comment
    // that used to sit on it below) stay as separate Prisma calls.
  ] = await prisma.$transaction([
    prisma.$queryRaw<
      [
        {
          totalCarriers: number;
          unreadAlerts: number;
          scheduledInspections: number;
          networksDetected: number;
          carriersWithGap: number;
          declaredFleet: number;
          confirmedOutcomes: number;
        },
      ]
    >`
      SELECT
        (SELECT COUNT(*)::int FROM "Carrier") AS "totalCarriers",
        (SELECT COUNT(*)::int FROM "Alert" WHERE "is_read" = false AND "is_dismissed" = false) AS "unreadAlerts",
        (SELECT COUNT(*)::int FROM "Inspection" WHERE "status" = 'SCHEDULED') AS "scheduledInspections",
        (SELECT COUNT(*)::int FROM "OwnershipNetwork") AS "networksDetected",
        (SELECT COUNT(*)::int FROM "Alert" WHERE "alert_type" = 'FLEET_GAP_DETECTED' AND "is_dismissed" = false) AS "carriersWithGap",
        (SELECT COALESCE(SUM("declared_fleet_size"), 0)::int FROM "Carrier") AS "declaredFleet",
        -- confirmedOutcomes: the lifetime count, used below only as the fallback
        -- for inspectionsSinceLastPrediction (no prediction run yet -> every
        -- outcome logged so far is "since" it). It is a deliberate transcription
        -- of the retrain gate at ml-service/app.py:318-324:
        --   SELECT COUNT(*) FROM "Inspection"
        --   WHERE status = 'COMPLETED' AND outcome IS NOT NULL
        -- Both predicates matter: outcome IS NOT NULL is what makes an inspection a
        -- usable training row, and status='COMPLETED' is what the service enforces.
        (SELECT COUNT(*)::int FROM "Inspection" WHERE "status" = 'COMPLETED' AND "outcome" IS NOT NULL) AS "confirmedOutcomes"
    `,
    prisma.carrier.findMany({
      select: {
        licenseStatus: true,
        complianceScores: { orderBy: { computedAt: "desc" }, take: 1, select: { riskTier: true } },
      },
    }),
    // carrier-scoped, mirroring the pipeline's _count.vehicles, so orphan
    // vehicles cannot inflate the gap
    prisma.vehicle.count({ where: { carrier: { isNot: null } } }),
  ]);
  const {
    totalCarriers,
    unreadAlerts,
    scheduledInspections,
    networksDetected,
    carriersWithGap,
    declaredFleet,
    confirmedOutcomes,
  } = scalarStats[0];

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

  // Carriers with no ComplianceScore row (never picked up by a prediction run,
  // per ml-service/app.py's ACTIVE-only feature query) are invisible to
  // riskCounts. Tallied here by licenseStatus so the dashboard can say WHY the
  // ring's total falls short of totalCarriers instead of leaving that gap
  // unexplained.
  const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  const unscoredByStatus: Record<string, number> = {};
  for (const c of carrierTiers) {
    const tier = c.complianceScores[0]?.riskTier;
    if (tier) riskCounts[tier]++;
    else unscoredByStatus[c.licenseStatus] = (unscoredByStatus[c.licenseStatus] ?? 0) + 1;
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
    unscoredByStatus,
    unreadAlerts,
    scheduledInspections,
    networksDetected,
    carriersWithGap,
    declaredFleet,
    actualFleet,
    inspectionsSinceLastPrediction,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <DashboardView stats={stats} />;
}
