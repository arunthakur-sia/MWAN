import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { InspectionDetailView } from "@/components/inspections/InspectionDetailView";

export const dynamic = "force-dynamic";

async function getInspection(id: string) {
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      carrier: {
        include: {
          complianceScores: { orderBy: { computedAt: "desc" }, take: 1 },
          _count: { select: { vehicles: { where: { registrationStatus: "ACTIVE" } } } },
        },
      },
    },
  });
  return inspection;
}

export default async function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inspection = await getInspection(id);
  if (!inspection) notFound();
  const { carrier } = inspection;
  const score = carrier.complianceScores[0];

  return (
    <InspectionDetailView
      data={{
        id: inspection.id,
        scheduledDate: inspection.scheduledDate.toISOString(),
        status: inspection.status,
        outcome: inspection.outcome,
        actualFleetSize: inspection.actualFleetSize,
        notes: inspection.notes,
        carrier: {
          id: carrier.id,
          companyName: carrier.companyName,
          declaredFleetSize: carrier.declaredFleetSize,
          actualFleet: carrier._count.vehicles,
          riskTier: score?.riskTier ?? null,
        },
      }}
    />
  );
}
