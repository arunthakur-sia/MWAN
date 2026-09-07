import { PrismaClient } from "@prisma/client";

// The synthetic LMS_Historical_Declarations sheet generated "Declared Fleet
// Size", "Fleet Change vs Prior" and "Change Reason" as independent random
// columns, so they routinely disagree with each other and with the actual
// quarter-over-quarter delta the fleet-history chart plots. This recomputes
// change_vs_prior from the real declared_fleet deltas (the chart itself is
// the source of truth) and reconciles change_reason against it, so a hovered
// tooltip can never show a number the chart doesn't back up.
const NO_CHANGE_REASON = "No change";

export async function fixDeclarationConsistency(prisma: PrismaClient): Promise<number> {
  const rows = await prisma.declaration.findMany({
    select: { id: true, carrierId: true, declaredFleet: true, changeVsPrior: true, changeReason: true, declarationDate: true },
  });

  const byCarrier = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = byCarrier.get(row.carrierId);
    if (list) list.push(row);
    else byCarrier.set(row.carrierId, [row]);
  }

  const updates: { id: string; changeVsPrior: number; changeReason: string | null }[] = [];

  for (const carrierRows of byCarrier.values()) {
    carrierRows.sort((a, b) => a.declarationDate.getTime() - b.declarationDate.getTime());

    carrierRows.forEach((row, i) => {
      if (i === 0) {
        // No prior declaration exists in this dataset to compute a real delta
        // against — 0/null ("not applicable"), not a guess.
        if (row.changeVsPrior !== 0 || row.changeReason !== null) {
          updates.push({ id: row.id, changeVsPrior: 0, changeReason: null });
        }
        return;
      }

      const actualDelta = row.declaredFleet - carrierRows[i - 1].declaredFleet;
      let correctReason = row.changeReason;
      if (actualDelta === 0) {
        correctReason = NO_CHANGE_REASON;
      } else if (row.changeReason === NO_CHANGE_REASON) {
        // A real change happened but the only label on file for it is a
        // contradiction — clear it rather than inventing a cause.
        correctReason = null;
      }

      if (actualDelta !== row.changeVsPrior || correctReason !== row.changeReason) {
        updates.push({ id: row.id, changeVsPrior: actualDelta, changeReason: correctReason });
      }
    });
  }

  for (const u of updates) {
    await prisma.declaration.update({ where: { id: u.id }, data: { changeVsPrior: u.changeVsPrior, changeReason: u.changeReason } });
  }
  return updates.length;
}
