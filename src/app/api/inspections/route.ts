import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  const riskTier = searchParams.get("riskTier"); // HIGH, MEDIUM, LOW
  const search = searchParams.get("search");

  const inspections = await prisma.inspection.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            carrier: {
              OR: [
                { companyName: { contains: search, mode: "insensitive" } },
                { licenseNumber: { contains: search, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: {
      carrier: {
        include: { complianceScores: { orderBy: { computedAt: "desc" }, take: 1 } },
      },
    },
  });

  let queue = inspections
    .map((i) => ({
      id: i.id,
      carrierId: i.carrierId,
      companyName: i.carrier.companyName,
      licenseNumber: i.carrier.licenseNumber,
      scheduledDate: i.scheduledDate,
      inspectorName: i.inspectorName,
      status: i.status,
      outcome: i.outcome,
      overallScore: i.carrier.complianceScores[0] ? Number(i.carrier.complianceScores[0].overallScore) : null,
      riskTier: i.carrier.complianceScores[0]?.riskTier ?? null,
    }))
    .sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1));

  if (riskTier) {
    queue = queue.filter((i) => i.riskTier === riskTier);
  }

  return NextResponse.json({ inspections: queue });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { carrierId, scheduledDate, inspectorName } = body;

  if (!carrierId || !scheduledDate) {
    return NextResponse.json({ error: "carrierId and scheduledDate are required" }, { status: 400 });
  }

  const inspection = await prisma.inspection.create({
    data: {
      id: randomUUID(),
      carrierId,
      scheduledDate: new Date(scheduledDate),
      inspectorName: inspectorName ?? null,
    },
  });

  return NextResponse.json({ inspection }, { status: 201 });
}
