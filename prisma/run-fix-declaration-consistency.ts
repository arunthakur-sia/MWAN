// One-off runner for fixDeclarationConsistency against an already-seeded
// database (the full seed.ts re-inserts rows and can't be re-run safely).
// Run this BEFORE run-enrich-change-reasons.ts — it can zero out a delta the
// enrichment step keys off of.
import { PrismaClient } from "@prisma/client";
import { fixDeclarationConsistency } from "./fixDeclarationConsistency";

const prisma = new PrismaClient();

fixDeclarationConsistency(prisma)
  .then((count) => console.log(`Recomputed change_vs_prior/change_reason for ${count} declarations`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
