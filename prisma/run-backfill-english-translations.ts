// One-off runner for backfillEnglishTranslations against an already-seeded
// database (the full seed.ts re-inserts rows and can't be re-run safely).
import { PrismaClient } from "@prisma/client";
import { backfillEnglishTranslations } from "./backfillEnglishTranslations";

const prisma = new PrismaClient();

backfillEnglishTranslations(prisma)
  .then((counts) => console.log("Backfilled English translations:", counts))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
