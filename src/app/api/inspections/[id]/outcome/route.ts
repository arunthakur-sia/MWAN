import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { computeCompositeScore, fleetGapToScore } from "@/lib/ml/scoring";
import { MODEL_VERSION_FALLBACK } from "@/lib/utils/constants";

// Outcomes where the inspector's ground truth resolves the fleet-gap flag that
// triggered the inspection — either nothing was wrong, or the declared fleet
// was just corrected to match reality.
const RESOLVING_OUTCOMES = new Set(["NO_VIOLATION_FOUND", "CONFIRMED_UNDER_DECLARATION"]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { outcome, actualFleetSize, notes } = body;

  if (!outcome) {
    return NextResponse.json({ error: "outcome is required" }, { status: 400 });
  }

  const inspection = await prisma.inspection.update({
    where: { id },
    data: {
      status: "COMPLETED",
      outcome,
      actualFleetSize: actualFleetSize ?? null,
      notes: notes ?? null,
      completedAt: new Date(),
    },
  });

  // Confirmed under-declaration corrects the carrier's declared fleet size,
  // closing the loop that /api/ml/retrain later learns from.
  if (outcome === "CONFIRMED_UNDER_DECLARATION" && actualFleetSize) {
    await prisma.carrier.update({
      where: { id: inspection.carrierId },
      data: { declaredFleetSize: actualFleetSize },
    });
  }

  // An inspection is the system's only source of real-world ground truth.
  // Without this, a carrier's risk tier and fleet-gap alerts stay stuck at
  // whatever the last (now-contradicted) automated pipeline run said, until
  // someone happens to click "Run Prediction" on the dashboard.
  if (RESOLVING_OUTCOMES.has(outcome)) {
    await rescoreAfterInspection(inspection.carrierId, outcome);
  }

  return NextResponse.json({ inspection });
}

async function rescoreAfterInspection(carrierId: string, outcome: string) {
  const carrier = await prisma.carrier.findUnique({
    where: { id: carrierId },
    include: {
      _count: { select: { vehicles: { where: { registrationStatus: "ACTIVE" } } } },
      complianceScores: { orderBy: { computedAt: "desc" }, take: 1 },
    },
  });
  if (!carrier) return;

  // NO_VIOLATION_FOUND means a human physically confirmed the declared fleet
  // is accurate, so the gap the automated pipeline flagged was a false
  // positive — treat it as resolved (score 0) rather than recomputing it from
  // the same vehicle-registry count that just got overruled.
  const actualFleet = carrier._count.vehicles;
  const gapPct =
    outcome === "NO_VIOLATION_FOUND"
      ? 0
      : actualFleet > 0
        ? ((actualFleet - carrier.declaredFleetSize) / actualFleet) * 100
        : 0;
  const fleetGapScore = fleetGapToScore(gapPct);

  const prior = carrier.complianceScores[0];
  const predictionScore = prior ? Number(prior.predictionScore) : 0;
  const networkRiskScore = prior ? Number(prior.networkRiskScore) : 0;

  const { overallScore, riskTier } = computeCompositeScore({
    fleetGapScore,
    predictionScore,
    networkRiskScore,
  });

  await prisma.complianceScore.create({
    data: {
      id: randomUUID(),
      carrierId,
      overallScore,
      fleetGapScore,
      predictionScore,
      networkRiskScore,
      riskTier,
      predictionConfidence: prior?.predictionConfidence ?? 0,
      topFactor1: prior?.topFactor1 ?? "",
      topFactor2: prior?.topFactor2 ?? "",
      topFactor3: prior?.topFactor3 ?? "",
      modelVersion: prior?.modelVersion ?? MODEL_VERSION_FALLBACK,
    },
  });

  await prisma.alert.updateMany({
    where: { carrierId, alertType: "FLEET_GAP_DETECTED", isDismissed: false },
    data: { isDismissed: true },
  });
}
