import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { fleetGapToScore } from "@/lib/ml/scoring";
import { scoreToRiskTier } from "@/lib/utils/constants";
import type { Prisma } from "@prisma/client";

export async function POST() {
  const carriers = await prisma.carrier.findMany({
    where: { licenseStatus: "ACTIVE" },
    include: {
      vehicles: { where: { registrationStatus: "ACTIVE" }, select: { id: true } },
    },
  });

  const results: {
    carrierId: string;
    companyName: string;
    licenseNumber: string;
    declaredFleet: number;
    actualFleet: number;
    gap: number;
    gapPct: number;
    severity: "HIGH" | "MEDIUM" | "LOW";
  }[] = [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const alertedToday = await prisma.alert.findMany({
    where: { alertType: "FLEET_GAP_DETECTED", createdAt: { gte: todayStart } },
    select: { carrierId: true },
  });
  const alreadyAlerted = new Set(alertedToday.map((a) => a.carrierId));
  const newAlerts: Prisma.AlertCreateManyInput[] = [];

  for (const carrier of carriers) {
    const actualFleet = carrier.vehicles.length;
    const declaredFleet = carrier.declaredFleetSize;
    const gap = actualFleet - declaredFleet;
    const gapPct = actualFleet > 0 ? (gap / actualFleet) * 100 : 0;

    if (gap > 0) {
      const severity = scoreToRiskTier(fleetGapToScore(gapPct));
      results.push({
        carrierId: carrier.id,
        companyName: carrier.companyName,
        licenseNumber: carrier.licenseNumber,
        declaredFleet,
        actualFleet,
        gap,
        gapPct: Math.round(gapPct * 10) / 10,
        severity,
      });

      if (gap >= 2 && !alreadyAlerted.has(carrier.id)) {
        newAlerts.push({
          carrierId: carrier.id,
          alertType: "FLEET_GAP_DETECTED",
          severity,
          title: `فجوة أسطول: ${gap} مركبات غير مصرح بها`,
          description: `${carrier.companyName} لديها ${actualFleet} مركبات نشطة مسجلة في هيئة النقل العام، بينما تصرح بـ ${declaredFleet} فقط لدى مركز إدارة النفايات الوطني.`,
          titleEn: `Fleet gap: ${gap} undeclared vehicles`,
          descriptionEn: `${carrier.companyName} has ${actualFleet} active vehicles registered with the transport authority but declares only ${declaredFleet} to the waste management center.`,
        });
      }
    }
  }

  if (newAlerts.length > 0) {
    await prisma.alert.createMany({ data: newAlerts });
  }

  results.sort((a, b) => b.gapPct - a.gapPct);

  return NextResponse.json({
    totalCarriersAnalyzed: carriers.length,
    carriersWithGap: results.length,
    results,
  });
}
