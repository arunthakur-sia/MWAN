import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const gapStatus = searchParams.get("gapStatus");

  const gapFilter =
    gapStatus === "under"
      ? { gt: 0 }
      : gapStatus === "over"
        ? { lt: 0 }
        : gapStatus === "correct"
          ? { equals: 0 }
          : undefined;

  const networks = await prisma.ownershipNetwork.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { networkName: { contains: search, mode: "insensitive" } },
              { primaryOwnerName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(gapFilter ? { combinedGap: gapFilter } : {}),
    },
    orderBy: { combinedGap: "desc" },
    include: {
      members: {
        include: { carrier: { select: { id: true, companyName: true } } },
      },
    },
  });

  return NextResponse.json({
    networks: networks.map((n) => ({
      id: n.id,
      networkName: n.networkName,
      primaryOwnerName: n.primaryOwnerName,
      memberCount: n.memberCount,
      totalDeclared: n.totalDeclared,
      totalActual: n.totalActual,
      combinedGap: n.combinedGap,
      sharedAddress: n.sharedAddress,
      members: n.members.map((m) => ({ id: m.carrier.id, companyName: m.carrier.companyName })),
    })),
  });
}
