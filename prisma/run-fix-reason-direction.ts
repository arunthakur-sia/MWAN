// One-off runner for fixReasonDirection against an already-seeded database.
// Run after run-fix-declaration-consistency.ts (needs the corrected deltas)
// and before run-enrich-change-reasons.ts.
import { PrismaClient } from "@prisma/client";
import { fixReasonDirection } from "./fixReasonDirection";

const prisma = new PrismaClient();

fixReasonDirection(prisma)
  .then((count) => console.log(`Corrected direction of ${count} change reasons`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
