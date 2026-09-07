import { PrismaClient } from "@prisma/client";

// change_reason values that only make sense on one side of zero. "License
// expired"/"License suspended" are excluded — they're carrier-status-derived
// (see enrichLicenseChangeReasons) and only ever assigned to a negative delta
// by construction, so they never need remapping here.
const POSITIVE_ONLY = new Set(["Fleet expansion", "New contract"]);
const NEGATIVE_ONLY = new Set(["Vehicle decommissioned"]);
// Direction-agnostic: plausible on either side of zero, left untouched either way.
const NEUTRAL = ["Merger/acquisition", "Vehicle transferred", "Seasonal adjustment"];

const POSITIVE_CANDIDATES = ["Fleet expansion", "New contract", ...NEUTRAL];
const NEGATIVE_CANDIDATES = ["Vehicle decommissioned", ...NEUTRAL];

// Deterministic (not random) so re-running this script is a no-op once fixed,
// and picks across the candidate set instead of collapsing every remap onto
// one label.
function pick(candidates: string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return candidates[hash % candidates.length];
}

export async function fixReasonDirection(prisma: PrismaClient): Promise<number> {
  const rows = await prisma.declaration.findMany({
    select: { id: true, changeVsPrior: true, changeReason: true },
  });

  const updates: { id: string; changeReason: string }[] = [];
  for (const row of rows) {
    if (!row.changeReason) continue;
    if (row.changeVsPrior > 0 && NEGATIVE_ONLY.has(row.changeReason)) {
      updates.push({ id: row.id, changeReason: pick(POSITIVE_CANDIDATES, row.id) });
    } else if (row.changeVsPrior < 0 && POSITIVE_ONLY.has(row.changeReason)) {
      updates.push({ id: row.id, changeReason: pick(NEGATIVE_CANDIDATES, row.id) });
    }
  }

  for (const u of updates) {
    await prisma.declaration.update({ where: { id: u.id }, data: { changeReason: u.changeReason } });
  }
  return updates.length;
}
