import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const carrier = await prisma.carrier.findUnique({
    where: { id },
    include: {
      complianceScores: { orderBy: { computedAt: "desc" }, take: 1 },
      _count: { select: { vehicles: { where: { registrationStatus: "ACTIVE" } } } },
      networkMembers: { include: { network: true } },
      inspections: { orderBy: { createdAt: "desc" }, take: 5 },
      alerts: { orderBy: { createdAt: "desc" }, take: 10, where: { isDismissed: false } },
    },
  });

  if (!carrier) {
    return NextResponse.json({ error: "Carrier not found" }, { status: 404 });
  }

  const companyRegistry = await prisma.companyRegistry.findUnique({
    where: { companyId: carrier.companyId },
    include: { shareholders: true, directors: true },
  });

  const latestScore = carrier.complianceScores[0] ?? null;

  return NextResponse.json({
    carrier: {
      id: carrier.id,
      licenseNumber: carrier.licenseNumber,
      companyName: carrier.companyName,
      companyId: carrier.companyId,
      crNumber: carrier.crNumber,
      licenseStatus: carrier.licenseStatus,
      serviceType: carrier.serviceType,
      declaredFleet: carrier.declaredFleetSize,
      actualFleet: carrier._count.vehicles,
      fleetGap: carrier._count.vehicles - carrier.declaredFleetSize,
      issueDate: carrier.issueDate,
      endDate: carrier.endDate,
      lastRenewalDate: carrier.lastRenewalDate,
      email: carrier.email,
      mobile: carrier.mobile,
      city: carrier.city,
      region: carrier.region,
    },
    score: latestScore
      ? {
          overallScore: Number(latestScore.overallScore),
          fleetGapScore: Number(latestScore.fleetGapScore),
          predictionScore: Number(latestScore.predictionScore),
          networkRiskScore: Number(latestScore.networkRiskScore),
          riskTier: latestScore.riskTier,
          predictionConfidence: Number(latestScore.predictionConfidence),
          topFactors: [latestScore.topFactor1, latestScore.topFactor2, latestScore.topFactor3],
          modelVersion: latestScore.modelVersion,
          computedAt: latestScore.computedAt,
        }
      : null,
    networks: carrier.networkMembers.map((m) => ({
      id: m.network.id,
      primaryOwnerName: m.network.primaryOwnerName,
      memberCount: m.network.memberCount,
      combinedGap: m.network.combinedGap,
      role: m.role,
    })),
    ownership: companyRegistry
      ? {
          legalForm: companyRegistry.legalForm,
          registeredAddress: companyRegistry.registeredAddress,
          incorporationDate: companyRegistry.incorporationDate,
          shareholders: companyRegistry.shareholders.map((s) => ({
            name: s.name,
            ownershipPct: Number(s.ownershipPct),
            nationalId: s.nationalId,
          })),
          directors: companyRegistry.directors.map((d) => ({ name: d.name, position: d.position })),
        }
      : null,
    recentInspections: carrier.inspections,
    activeAlerts: carrier.alerts,
  });
}
