import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CarrierDetailView } from "@/components/carriers/CarrierDetailView";

export const dynamic = "force-dynamic";

async function getCarrier(id: string) {
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
  if (!carrier) return null;

  const registry = await prisma.companyRegistry.findUnique({
    where: { companyId: carrier.companyId },
    include: { shareholders: true, directors: true },
  });

  return { carrier, registry };
}

export default async function CarrierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCarrier(id);
  if (!result) notFound();
  const { carrier, registry } = result;
  const score = carrier.complianceScores[0];

  return (
    <CarrierDetailView
      data={{
        id: carrier.id,
        companyName: carrier.companyName,
        companyNameEn: carrier.companyNameEn ?? carrier.companyName,
        licenseNumber: carrier.licenseNumber,
        serviceType: carrier.serviceType,
        serviceTypeEn: carrier.serviceTypeEn ?? carrier.serviceType,
        city: carrier.city,
        cityEn: carrier.cityEn ?? carrier.city,
        region: carrier.region,
        regionEn: carrier.regionEn ?? carrier.region,
        licenseStatus: carrier.licenseStatus,
        issueDate: carrier.issueDate.toISOString(),
        lastRenewalDate: carrier.lastRenewalDate ? carrier.lastRenewalDate.toISOString() : null,
        endDate: carrier.endDate.toISOString(),
        declaredFleetSize: carrier.declaredFleetSize,
        actualFleet: carrier._count.vehicles,
        score: score
          ? {
              overallScore: Number(score.overallScore),
              riskTier: score.riskTier,
              topFactor1: score.topFactor1,
              topFactor2: score.topFactor2,
              topFactor3: score.topFactor3,
              predictionConfidence: Number(score.predictionConfidence),
            }
          : null,
        registry: registry
          ? {
              legalForm: registry.legalForm,
              legalFormEn: registry.legalFormEn ?? registry.legalForm,
              shareholders: registry.shareholders.map((s) => ({
                id: s.id,
                name: s.name,
                nameEn: s.nameEn ?? s.name,
                ownershipPct: Number(s.ownershipPct),
              })),
              directors: registry.directors.map((d) => ({
                id: d.id,
                name: d.name,
                nameEn: d.nameEn ?? d.name,
                position: d.position,
                positionEn: d.positionEn ?? d.position,
              })),
            }
          : null,
        networkMembers: carrier.networkMembers.map((m) => ({
          id: m.id,
          networkId: m.network.id,
          primaryOwnerName: m.network.primaryOwnerName,
          primaryOwnerNameEn: m.network.primaryOwnerNameEn ?? m.network.primaryOwnerName,
          memberCount: m.network.memberCount,
        })),
        inspections: carrier.inspections.map((i) => ({
          id: i.id,
          scheduledDate: i.scheduledDate.toISOString(),
          outcome: i.outcome,
          status: i.status,
        })),
        alerts: carrier.alerts.map((a) => ({
          id: a.id,
          severity: a.severity,
          title: a.title,
          description: a.description,
          titleEn: a.titleEn ?? a.title,
          descriptionEn: a.descriptionEn ?? a.description,
        })),
      }}
    />
  );
}
