import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { detectNetworks } from "@/lib/ml/client";
import type { Prisma } from "@prisma/client";

export const maxDuration = 60;

export async function POST() {
  const { networks } = await detectNetworks();

  // Idempotent re-run: replace the prior detection results.
  await prisma.networkMembership.deleteMany({});
  await prisma.ownershipNetwork.deleteMany({});

  const [carriers, shareholders, directors, registries] = await Promise.all([
    prisma.carrier.findMany({
      include: { _count: { select: { vehicles: { where: { registrationStatus: "ACTIVE" } } } } },
    }),
    prisma.shareholder.findMany({ select: { nationalId: true, name: true, nameEn: true } }),
    prisma.director.findMany({ select: { nationalId: true, name: true, nameEn: true } }),
    prisma.companyRegistry.findMany({
      select: { companyId: true, registeredAddress: true, registeredAddressEn: true },
    }),
  ]);

  const carrierByCompanyId = new Map(carriers.map((c) => [c.companyId, c]));
  const nameByNationalId = new Map<string, string>();
  const nameEnByNationalId = new Map<string, string>();
  for (const d of directors) {
    nameByNationalId.set(d.nationalId, d.name);
    if (d.nameEn) nameEnByNationalId.set(d.nationalId, d.nameEn);
  }
  for (const s of shareholders) {
    nameByNationalId.set(s.nationalId, s.name);
    if (s.nameEn) nameEnByNationalId.set(s.nationalId, s.nameEn);
  }
  const addressByCompanyId = new Map(registries.map((r) => [r.companyId, r.registeredAddress]));
  const addressEnByCompanyId = new Map(registries.map((r) => [r.companyId, r.registeredAddressEn]));

  const networkRows: Prisma.OwnershipNetworkCreateManyInput[] = [];
  const membershipRows: Prisma.NetworkMembershipCreateManyInput[] = [];

  for (const net of networks) {
    const memberCarriers = net.member_company_ids
      .map((cid) => carrierByCompanyId.get(cid))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    if (memberCarriers.length < 2) continue;

    const totalDeclared = memberCarriers.reduce((sum, c) => sum + c.declaredFleetSize, 0);
    const totalActual = memberCarriers.reduce((sum, c) => sum + c._count.vehicles, 0);
    const primaryOwnerName = nameByNationalId.get(net.primary_owner_id) ?? "Unknown";
    const primaryOwnerNameEn = nameEnByNationalId.get(net.primary_owner_id) ?? primaryOwnerName;
    const sharedAddress = addressByCompanyId.get(net.member_company_ids[0]) ?? null;
    const sharedAddressEn = addressEnByCompanyId.get(net.member_company_ids[0]) ?? sharedAddress;

    const networkId = randomUUID();
    networkRows.push({
      id: networkId,
      networkName: net.network_id,
      primaryOwnerId: net.primary_owner_id,
      primaryOwnerName,
      primaryOwnerNameEn,
      memberCount: memberCarriers.length,
      totalDeclared,
      totalActual,
      combinedGap: totalActual - totalDeclared,
      sharedAddress,
      sharedAddressEn,
    });

    for (const c of memberCarriers) {
      membershipRows.push({ id: randomUUID(), networkId, carrierId: c.id, role: "MEMBER" });
    }
  }

  if (networkRows.length > 0) {
    await prisma.ownershipNetwork.createMany({ data: networkRows });
    await prisma.networkMembership.createMany({ data: membershipRows });
  }

  return NextResponse.json({
    networksDetected: networkRows.length,
    networkIds: networkRows.map((n) => n.id),
  });
}
