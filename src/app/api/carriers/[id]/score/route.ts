import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const score = await prisma.complianceScore.findFirst({
    where: { carrierId: id },
    orderBy: { computedAt: "desc" },
  });

  if (!score) {
    return NextResponse.json({ error: "No score computed yet for this carrier" }, { status: 404 });
  }

  return NextResponse.json({
    overallScore: Number(score.overallScore),
    fleetGapScore: Number(score.fleetGapScore),
    predictionScore: Number(score.predictionScore),
    networkRiskScore: Number(score.networkRiskScore),
    riskTier: score.riskTier,
    predictionConfidence: Number(score.predictionConfidence),
    topFactors: [score.topFactor1, score.topFactor2, score.topFactor3],
    modelVersion: score.modelVersion,
    computedAt: score.computedAt,
  });
}
