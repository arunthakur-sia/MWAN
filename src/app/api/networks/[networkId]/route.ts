import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ networkId: string }> }) {
  const { networkId } = await params;

  const network = await prisma.ownershipNetwork.findUnique({
    where: { id: networkId },
    include: { members: { include: { carrier: true } } },
  });

  if (!network) {
    return NextResponse.json({ error: "Network not found" }, { status: 404 });
  }

  const companyIds = network.members.map((m) => m.carrier.companyId);
  const registries = await prisma.companyRegistry.findMany({
    where: { companyId: { in: companyIds } },
    include: { shareholders: { where: { status: "ACTIVE" } }, directors: { where: { status: "ACTIVE" } } },
  });

  const nodes: { id: string; type: "company" | "person"; label: string; labelEn: string }[] = [];
  const links: { source: string; target: string; relation: string; weight: number }[] = [];
  const seenPeople = new Set<string>();

  for (const registry of registries) {
    const companyNodeId = `company:${registry.companyId}`;
    nodes.push({
      id: companyNodeId,
      type: "company",
      label: registry.companyName,
      labelEn: registry.companyNameEn ?? registry.companyName,
    });

    for (const s of registry.shareholders) {
      const personNodeId = `person:${s.nationalId}`;
      if (!seenPeople.has(personNodeId)) {
        nodes.push({ id: personNodeId, type: "person", label: s.name, labelEn: s.nameEn ?? s.name });
        seenPeople.add(personNodeId);
      }
      links.push({ source: companyNodeId, target: personNodeId, relation: "shareholder", weight: Number(s.ownershipPct) });
    }

    for (const d of registry.directors) {
      const personNodeId = `person:${d.nationalId}`;
      if (!seenPeople.has(personNodeId)) {
        nodes.push({ id: personNodeId, type: "person", label: d.name, labelEn: d.nameEn ?? d.name });
        seenPeople.add(personNodeId);
      }
      links.push({ source: companyNodeId, target: personNodeId, relation: "director", weight: 30 });
    }
  }

  return NextResponse.json({
    network: {
      id: network.id,
      networkName: network.networkName,
      primaryOwnerName: network.primaryOwnerName,
      primaryOwnerNameEn: network.primaryOwnerNameEn ?? network.primaryOwnerName,
      memberCount: network.memberCount,
      totalDeclared: network.totalDeclared,
      totalActual: network.totalActual,
      combinedGap: network.combinedGap,
      sharedAddress: network.sharedAddress,
      sharedAddressEn: network.sharedAddressEn ?? network.sharedAddress,
      members: network.members.map((m) => ({
        id: m.carrier.id,
        companyName: m.carrier.companyName,
        companyNameEn: m.carrier.companyNameEn ?? m.carrier.companyName,
        declaredFleet: m.carrier.declaredFleetSize,
      })),
    },
    graph: { nodes, links },
  });
}
