import { PrismaClient } from "@prisma/client";

// The synthetic declaration data has no "License expired"/"License suspended"
// change reason of its own — those two are attributed here from the carrier's
// real license_status/end_date instead of being randomly generated, so the
// fleet-history tooltip only ever cites a lapse where one actually happened.
const REASON_BY_STATUS: Record<string, string> = {
  EXPIRED: "License expired",
  SUSPENDED: "License suspended",
};

export async function enrichLicenseChangeReasons(prisma: PrismaClient): Promise<number> {
  const lapsedCarriers = await prisma.carrier.findMany({
    where: { licenseStatus: { in: ["EXPIRED", "SUSPENDED"] } },
    select: { id: true, licenseStatus: true },
  });

  let updated = 0;
  for (const carrier of lapsedCarriers) {
    const reason = REASON_BY_STATUS[carrier.licenseStatus];
    if (!reason) continue;

    const lastDeclaration = await prisma.declaration.findFirst({
      where: { carrierId: carrier.id },
      orderBy: { declarationDate: "desc" },
    });
    if (!lastDeclaration || lastDeclaration.changeVsPrior >= 0) continue;

    await prisma.declaration.update({
      where: { id: lastDeclaration.id },
      data: { changeReason: reason },
    });
    updated++;
  }
  return updated;
}
