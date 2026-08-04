import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runPredictions } from "@/lib/ml/client";
import { computeCompositeScore, fleetGapToScore, networkToScore } from "@/lib/ml/scoring";
import type { Prisma } from "@prisma/client";

export const maxDuration = 60;

export async function POST() {
  const { predictions, model_version } = await runPredictions();

  const carriers = await prisma.carrier.findMany({
    include: {
      _count: { select: { vehicles: { where: { registrationStatus: "ACTIVE" } } } },
      networkMembers: { include: { network: true } },
    },
  });
  const carrierById = new Map(carriers.map((c) => [c.id, c]));

  const rows: Prisma.ComplianceScoreCreateManyInput[] = [];

  for (const pred of predictions) {
    const carrier = carrierById.get(pred.carrier_id);
    if (!carrier) continue;

    const actualFleet = carrier._count.vehicles;
    const gapPct = actualFleet > 0 ? ((actualFleet - carrier.declaredFleetSize) / actualFleet) * 100 : 0;
    const fleetGapScore = fleetGapToScore(gapPct);

    const network = carrier.networkMembers[0]?.network;
    const networkRiskScore = network ? networkToScore(network.memberCount, network.combinedGap) : 0;

    const predictionScore = Math.round(pred.probability * 10000) / 100;

    const { overallScore, riskTier } = computeCompositeScore({
      fleetGapScore,
      predictionScore,
      networkRiskScore,
    });

    // Store the raw feature key; the UI translates it per-locale at render time.
    const topFactors = pred.top_factors.slice(0, 3).map((f) => f.feature);
    while (topFactors.length < 3) topFactors.push("");

    rows.push({
      id: randomUUID(),
      carrierId: carrier.id,
      overallScore,
      fleetGapScore,
      predictionScore,
      networkRiskScore,
      riskTier,
      predictionConfidence: pred.probability,
      topFactor1: topFactors[0],
      topFactor2: topFactors[1],
      topFactor3: topFactors[2],
      modelVersion: model_version,
    });
  }

  if (rows.length > 0) {
    await prisma.complianceScore.createMany({ data: rows });
  }

  return NextResponse.json({ scored: rows.length, modelVersion: model_version });
}
