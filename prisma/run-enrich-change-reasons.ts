// One-off runner for enrichLicenseChangeReasons against an already-seeded
// database (the full seed.ts re-inserts rows and can't be re-run safely).
import { PrismaClient } from "@prisma/client";
import { enrichLicenseChangeReasons } from "./enrichLicenseChangeReasons";

const prisma = new PrismaClient();

enrichLicenseChangeReasons(prisma)
  .then((count) => console.log(`Updated ${count} declarations with license-status change reasons`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
