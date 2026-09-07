import { PrismaClient } from "@prisma/client";
import {
  translateCompanyName,
  translateAddress,
  translatePersonName,
  CITY_EN,
  REGION_EN,
  SERVICE_TYPE_EN,
  LEGAL_FORM_EN,
  SHAREHOLDER_ROLE_EN,
  DIRECTOR_POSITION_EN,
  VEHICLE_TYPE_EN,
  VEHICLE_CLASSIFICATION_EN,
  PLATE_TYPE_EN,
} from "./arabicToEnglish";

// Runs `fn` over `items` with at most `limit` in flight at once — the seeded
// tables run into the thousands of rows (8k+ vehicles) and this DB's pooler
// caps concurrent connections, so unbounded Promise.all or a bare for-await
// loop are both wrong (connection storm vs. one row per round trip).
async function runConcurrent<T>(items: T[], limit: number, fn: (item: T) => Promise<unknown>) {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++];
      await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

// For a column whose English value is fully determined by its own Arabic value
// (i.e. dictionary-backed, not per-row unique text), group rows by distinct
// value and issue one `updateMany` per group instead of one query per row —
// collapses e.g. 8,365 Vehicle rows sharing 8 distinct vehicle types into 8
// queries.
async function backfillDictionaryField<Row extends { id: string }>(
  model: { updateMany: (args: { where: { id: { in: string[] } }; data: Record<string, unknown> }) => Promise<unknown> },
  rows: Row[],
  sourceField: keyof Row,
  targetField: string,
  dict: Record<string, string>,
) {
  const idsByValue = new Map<string, string[]>();
  for (const row of rows) {
    const value = row[sourceField];
    if (value == null || typeof value !== "string") continue;
    const ids = idsByValue.get(value) ?? [];
    ids.push(row.id);
    idsByValue.set(value, ids);
  }
  await runConcurrent([...idsByValue.entries()], 5, ([value, ids]) =>
    model.updateMany({ where: { id: { in: ids } }, data: { [targetField]: dict[value] ?? value } }),
  );
}

// Populates the `*En` sibling columns for every Arabic field seeded from the
// synthetic dataset, so the app can show an all-English view without ever
// re-querying a translation service at request time.
export async function backfillEnglishTranslations(prisma: PrismaClient): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  // ─── Carrier ── companyName is per-row unique; city/region are 15/10-value
  // dictionaries but cheap enough to fold into the same per-row update. ─────
  const carriers = await prisma.carrier.findMany({
    select: { id: true, companyName: true, city: true, region: true, serviceType: true },
  });
  await runConcurrent(carriers, 5, (c) =>
    prisma.carrier.update({
      where: { id: c.id },
      data: {
        companyNameEn: translateCompanyName(c.companyName),
        cityEn: c.city ? (CITY_EN[c.city] ?? c.city) : null,
        regionEn: c.region ? (REGION_EN[c.region] ?? c.region) : null,
        serviceTypeEn: SERVICE_TYPE_EN[c.serviceType] ?? c.serviceType,
      },
    }),
  );
  counts.Carrier = carriers.length;

  // ─── CompanyRegistry ── companyName/registeredAddress are per-row unique;
  // legalForm/city/region/activityDescription ride along on the same update. ─
  const registries = await prisma.companyRegistry.findMany({
    select: {
      id: true,
      companyName: true,
      legalForm: true,
      city: true,
      region: true,
      registeredAddress: true,
      activityDescription: true,
    },
  });
  await runConcurrent(registries, 5, (r) =>
    prisma.companyRegistry.update({
      where: { id: r.id },
      data: {
        companyNameEn: translateCompanyName(r.companyName),
        legalFormEn: r.legalForm ? (LEGAL_FORM_EN[r.legalForm] ?? r.legalForm) : null,
        cityEn: r.city ? (CITY_EN[r.city] ?? r.city) : null,
        regionEn: r.region ? (REGION_EN[r.region] ?? r.region) : null,
        registeredAddressEn: r.registeredAddress ? translateAddress(r.registeredAddress) : null,
        activityDescriptionEn: r.activityDescription
          ? (SERVICE_TYPE_EN[r.activityDescription] ?? r.activityDescription)
          : null,
      },
    }),
  );
  counts.CompanyRegistry = registries.length;

  // ─── Shareholder ── name is drawn from a small fixed pool of person names
  // (46 in the synthetic dataset) despite there being ~1k rows, so group by
  // distinct name/role instead of updating every row individually. ─────────
  const shareholders = await prisma.shareholder.findMany({ select: { id: true, name: true, role: true } });
  await backfillDictionaryField(
    prisma.shareholder,
    shareholders,
    "name",
    "nameEn",
    Object.fromEntries([...new Set(shareholders.map((s) => s.name))].map((n) => [n, translatePersonName(n)])),
  );
  await backfillDictionaryField(prisma.shareholder, shareholders, "role", "roleEn", SHAREHOLDER_ROLE_EN);
  counts.Shareholder = shareholders.length;

  // ─── Director ── same reasoning as Shareholder. ─────────────────────────
  const directors = await prisma.director.findMany({ select: { id: true, name: true, position: true } });
  await backfillDictionaryField(
    prisma.director,
    directors,
    "name",
    "nameEn",
    Object.fromEntries([...new Set(directors.map((d) => d.name))].map((n) => [n, translatePersonName(n)])),
  );
  await backfillDictionaryField(prisma.director, directors, "position", "positionEn", DIRECTOR_POSITION_EN);
  counts.Director = directors.length;

  // ─── Vehicle ── all three fields are pure dictionaries (8/5/3 distinct
  // values) shared across 8k+ rows — this is where per-row updates would hurt. ─
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, vehicleType: true, vehicleClassification: true, plateType: true },
  });
  await backfillDictionaryField(prisma.vehicle, vehicles, "vehicleType", "vehicleTypeEn", VEHICLE_TYPE_EN);
  await backfillDictionaryField(
    prisma.vehicle,
    vehicles,
    "vehicleClassification",
    "vehicleClassificationEn",
    VEHICLE_CLASSIFICATION_EN,
  );
  await backfillDictionaryField(prisma.vehicle, vehicles, "plateType", "plateTypeEn", PLATE_TYPE_EN);
  counts.Vehicle = vehicles.length;

  // ─── OwnershipNetwork ── primaryOwnerName/sharedAddress are copied verbatim
  // from Shareholder/Director.name and CompanyRegistry.registeredAddress at
  // detection time, so their En counterparts are looked up the same way here
  // rather than re-derived. Small table (dozens of rows) — no batching needed.
  const networks = await prisma.ownershipNetwork.findMany({
    select: { id: true, primaryOwnerName: true, sharedAddress: true },
  });
  await runConcurrent(networks, 5, (n) =>
    prisma.ownershipNetwork.update({
      where: { id: n.id },
      data: {
        primaryOwnerNameEn: translatePersonName(n.primaryOwnerName),
        sharedAddressEn: n.sharedAddress ? translateAddress(n.sharedAddress) : null,
      },
    }),
  );
  counts.OwnershipNetwork = networks.length;

  return counts;
}
