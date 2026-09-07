import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "25");
  const riskTier = searchParams.get("riskTier"); // HIGH, MEDIUM, LOW
  const licenseStatus = searchParams.get("licenseStatus"); // ACTIVE, SUSPENDED, EXPIRED, REVOKED
  const region = searchParams.get("region");
  const sortBy = searchParams.get("sortBy") || "overallScore";
  const sortDir = searchParams.get("sortDir") || "desc";
  const search = searchParams.get("search");

  const where: Prisma.CarrierWhereInput = {};
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { licenseNumber: { contains: search, mode: "insensitive" } },
      { companyId: { contains: search, mode: "insensitive" } },
    ];
  }
  if (licenseStatus) {
    where.licenseStatus = licenseStatus as never;
  }
  if (region) {
    where.region = region;
  }

  const carriers = await prisma.carrier.findMany({
    where,
    select: {
      id: true,
      licenseNumber: true,
      companyName: true,
      companyNameEn: true,
      companyId: true,
      declaredFleetSize: true,
      licenseStatus: true,
      city: true,
      cityEn: true,
      region: true,
      regionEn: true,
      complianceScores: {
        orderBy: { computedAt: "desc" },
        take: 1,
        select: { overallScore: true, riskTier: true, computedAt: true },
      },
      _count: { select: { vehicles: { where: { registrationStatus: "ACTIVE" } } } },
    },
  });

  let result = carriers.map((c) => ({
    id: c.id,
    licenseNumber: c.licenseNumber,
    companyName: c.companyName,
    companyNameEn: c.companyNameEn ?? c.companyName,
    companyId: c.companyId,
    declaredFleet: c.declaredFleetSize,
    actualFleet: c._count.vehicles,
    fleetGap: c._count.vehicles - c.declaredFleetSize,
    licenseStatus: c.licenseStatus,
    city: c.city,
    cityEn: c.cityEn ?? c.city,
    region: c.region,
    regionEn: c.regionEn ?? c.region,
    score: c.complianceScores[0]
      ? {
          overallScore: Number(c.complianceScores[0].overallScore),
          riskTier: c.complianceScores[0].riskTier,
          computedAt: c.complianceScores[0].computedAt,
        }
      : null,
  }));

  if (riskTier) {
    result = result.filter((c) => c.score?.riskTier === riskTier);
  }

  result.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "overallScore") {
      cmp = (a.score?.overallScore ?? -1) - (b.score?.overallScore ?? -1);
    } else if (sortBy === "fleetGap") {
      cmp = a.fleetGap - b.fleetGap;
    } else if (sortBy === "companyName") {
      cmp = a.companyName.localeCompare(b.companyName);
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  const total = result.length;
  const paged = result.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ carriers: paged, total, page, limit });
}
