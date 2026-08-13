import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { NetworkDetailView } from "@/components/networks/NetworkDetailView";

export const dynamic = "force-dynamic";

async function getNetwork(id: string) {
  const network = await prisma.ownershipNetwork.findUnique({
    where: { id },
    include: { members: { include: { carrier: true } } },
  });
  if (!network) return null;

  const companyIds = network.members.map((m) => m.carrier.companyId);
  const registries = await prisma.companyRegistry.findMany({
    where: { companyId: { in: companyIds } },
    include: { shareholders: { where: { status: "ACTIVE" } }, directors: { where: { status: "ACTIVE" } } },
  });

  const nodes: { id: string; type: "company" | "person"; label: string }[] = [];
  const links: { source: string; target: string; relation: string; weight: number }[] = [];
  const seenPeople = new Set<string>();

  for (const registry of registries) {
    const companyNodeId = `company:${registry.companyId}`;
    nodes.push({ id: companyNodeId, type: "company", label: registry.companyName });

    for (const s of registry.shareholders) {
      const personNodeId = `person:${s.nationalId}`;
      if (!seenPeople.has(personNodeId)) {
        nodes.push({ id: personNodeId, type: "person", label: s.name });
        seenPeople.add(personNodeId);
      }
      links.push({ source: companyNodeId, target: personNodeId, relation: "shareholder", weight: Number(s.ownershipPct) });
    }

    for (const d of registry.directors) {
      const personNodeId = `person:${d.nationalId}`;
      if (!seenPeople.has(personNodeId)) {
        nodes.push({ id: personNodeId, type: "person", label: d.name });
        seenPeople.add(personNodeId);
      }
      links.push({ source: companyNodeId, target: personNodeId, relation: "director", weight: 30 });
    }
  }

  return { network, nodes, links };
}

export default async function NetworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getNetwork(id);
  if (!result) notFound();
  const { network, nodes, links } = result;

  return (
    <NetworkDetailView
      data={{
        id: network.id,
        networkName: network.networkName,
        primaryOwnerName: network.primaryOwnerName,
        memberCount: network.memberCount,
        totalDeclared: network.totalDeclared,
        totalActual: network.totalActual,
        combinedGap: network.combinedGap,
        members: network.members.map((m) => ({
          id: m.id,
          carrierId: m.carrier.id,
          companyName: m.carrier.companyName,
          declaredFleetSize: m.carrier.declaredFleetSize,
        })),
        nodes,
        links,
      }}
    />
  );
}
