import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const networks = await prisma.ownershipNetwork.findMany({
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
