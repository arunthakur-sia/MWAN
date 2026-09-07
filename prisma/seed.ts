import { randomUUID } from "node:crypto";
import path from "node:path";
import * as XLSX from "xlsx";
import { PrismaClient, Prisma } from "@prisma/client";
import { backfillEnglishTranslations } from "./backfillEnglishTranslations";
import { enrichLicenseChangeReasons } from "./enrichLicenseChangeReasons";
import { fixDeclarationConsistency } from "./fixDeclarationConsistency";
import { fixReasonDirection } from "./fixReasonDirection";

const prisma = new PrismaClient();

const WORKBOOK_PATH = path.join(__dirname, "..", "Synthetic_Data_500_Companies.xlsx");

function sheetRows<T = Record<string, unknown>>(wb: XLSX.WorkBook, name: string): T[] {
  const sheet = wb.Sheets[name];
  if (!sheet) throw new Error(`Sheet not found: ${name}`);
  return XLSX.utils.sheet_to_json<T>(sheet, { defval: null });
}

// Source data uses Arabic status/type strings for MOC + TGA sheets; normalize to the
// canonical English values the app (and the ML service's raw SQL filters) expect.
function mapPersonOrCompanyStatus(v: string | null): string {
  if (v === "نشط") return "ACTIVE";
  if (v === "موقوف") return "SUSPENDED";
  return v ?? "ACTIVE";
}

function mapShareholderType(v: string | null): string {
  if (v === "فرد") return "INDIVIDUAL";
  if (v === "شركة") return "CORPORATE";
  return v ?? "INDIVIDUAL";
}

function mapVehicleStatus(v: string | null): string {
  if (v === "مسجل") return "ACTIVE";
  if (v === "منتهي") return "DEREGISTERED";
  return v ?? "ACTIVE";
}

function asDate(v: unknown): Date | null {
  if (v instanceof Date) return v;
  if (typeof v === "number") return XLSX.SSF.parse_date_code(v) ? new Date(v) : null;
  if (typeof v === "string" && v.trim()) return new Date(v);
  return null;
}

function asDateOrThrow(v: unknown, ctx: string): Date {
  const d = asDate(v);
  if (!d) throw new Error(`Missing required date: ${ctx}`);
  return d;
}

async function main() {
  console.log(`Reading ${WORKBOOK_PATH}`);
  const wb = XLSX.readFile(WORKBOOK_PATH, { cellDates: true });

  // ─── Pre-generate stable IDs keyed by the business "Company ID" ──────────
  const lmsRows = sheetRows<any>(wb, "LMS_Licenses");
  const mocRows = sheetRows<any>(wb, "MOC_Company_Registry");

  const carrierIdByCompanyId = new Map<string, string>();
  for (const row of lmsRows) carrierIdByCompanyId.set(String(row["Company ID"]), randomUUID());

  const registryIdByCompanyId = new Map<string, string>();
  for (const row of mocRows) registryIdByCompanyId.set(String(row["Company ID"]), randomUUID());

  // ─── 1. CompanyRegistry ───────────────────────────────────────────────────
  console.log(`Seeding CompanyRegistry (${mocRows.length})`);
  await prisma.companyRegistry.createMany({
    data: mocRows.map((row) => ({
      id: registryIdByCompanyId.get(String(row["Company ID"]))!,
      crNumber: String(row["CR Number"]),
      companyName: String(row["Company Name"]),
      companyId: String(row["Company ID"]),
      legalForm: row["Legal Form"] ?? null,
      incorporationDate: asDate(row["Date of Incorporation"]),
      status: mapPersonOrCompanyStatus(row["Status"]),
      registeredAddress: row["Registered Address"] ?? null,
      city: row["City"] ?? null,
      region: row["Region"] ?? null,
      capital: row["Capital (SAR)"] != null ? new Prisma.Decimal(row["Capital (SAR)"]) : null,
      activityDescription: row["Activity Description"] ?? null,
      parentCompanyCr: row["Parent Company CR"] ?? null,
    })),
  });

  // ─── 2. Shareholders ──────────────────────────────────────────────────────
  const shareholderRows = sheetRows<any>(wb, "MOC_Shareholders");
  console.log(`Seeding Shareholder (${shareholderRows.length})`);
  await prisma.shareholder.createMany({
    data: shareholderRows
      .filter((row) => registryIdByCompanyId.has(String(row["Company ID"])))
      .map((row) => ({
        id: randomUUID(),
        companyId: registryIdByCompanyId.get(String(row["Company ID"]))!,
        name: String(row["Shareholder Name"]),
        nationalId: String(row["Shareholder National ID"]),
        shareholderType: mapShareholderType(row["Shareholder Type"]),
        ownershipPct: new Prisma.Decimal(row["Ownership %"]),
        role: row["Role"] ?? null,
        startDate: asDate(row["Start Date"]),
        status: mapPersonOrCompanyStatus(row["Status"]),
      })),
  });

  // ─── 3. Directors ─────────────────────────────────────────────────────────
  const directorRows = sheetRows<any>(wb, "MOC_Directors");
  console.log(`Seeding Director (${directorRows.length})`);
  await prisma.director.createMany({
    data: directorRows
      .filter((row) => registryIdByCompanyId.has(String(row["Company ID"])))
      .map((row) => ({
        id: randomUUID(),
        companyId: registryIdByCompanyId.get(String(row["Company ID"]))!,
        name: String(row["Director Name"]),
        nationalId: String(row["National ID"]),
        position: String(row["Position"]),
        appointedDate: asDate(row["Appointment Date"]),
        status: mapPersonOrCompanyStatus(row["Status"]),
      })),
  });

  // ─── 4. Carriers ──────────────────────────────────────────────────────────
  console.log(`Seeding Carrier (${lmsRows.length})`);
  await prisma.carrier.createMany({
    data: lmsRows.map((row) => ({
      id: carrierIdByCompanyId.get(String(row["Company ID"]))!,
      licenseNumber: String(row["License Number"]),
      companyName: String(row["Company Name"]),
      companyId: String(row["Company ID"]),
      branchId: row["Branch ID"] != null ? String(row["Branch ID"]) : null,
      crNumber: row["CR Number"] ?? null,
      licenseStatus: row["License Status"],
      licenseType: row["License Type"] ?? "TRANSPORT",
      serviceType: String(row["Service Type"]),
      declaredFleetSize: Number(row["Declared Fleet Size"]),
      issueDate: asDateOrThrow(row["Issue Date"], `Carrier ${row["Company ID"]} issueDate`),
      endDate: asDateOrThrow(row["End Date"], `Carrier ${row["Company ID"]} endDate`),
      lastRenewalDate: asDate(row["Last Renewal Date"]),
      email: row["Email"] ?? null,
      mobile: row["Mobile"] != null ? String(row["Mobile"]) : null,
      city: row["City"] ?? null,
      region: row["Region"] ?? null,
    })),
  });

  // ─── 5. Historical declarations ───────────────────────────────────────────
  const declarationRows = sheetRows<any>(wb, "LMS_Historical_Declarations");
  console.log(`Seeding Declaration (${declarationRows.length})`);
  await prisma.declaration.createMany({
    data: declarationRows
      .filter((row) => carrierIdByCompanyId.has(String(row["Company ID"])))
      .map((row) => ({
        id: randomUUID(),
        carrierId: carrierIdByCompanyId.get(String(row["Company ID"]))!,
        period: String(row["Period"]),
        declaredFleet: Number(row["Declared Fleet Size"]),
        changeVsPrior: Number(row["Fleet Change vs Prior"] ?? 0),
        changeReason: row["Change Reason"] ?? null,
        declarationDate: asDateOrThrow(row["Declaration Date"], `Declaration ${row["License Number"]}`),
      })),
  });

  // ─── 5b. Recompute change_vs_prior/change_reason from the real fleet deltas ─
  // (the source columns are independently-random and routinely disagree with
  // declared_fleet itself), THEN attribute lapsed carriers' latest drop to
  // their license — order matters, since the fix above can zero out a delta
  // the enrichment step would otherwise have keyed off of.
  const fixedCount = await fixDeclarationConsistency(prisma);
  console.log(`Recomputed change_vs_prior/change_reason for ${fixedCount} declarations`);

  // ─── 5c. Fix reasons whose label direction contradicts the (now-correct) sign
  const directionFixedCount = await fixReasonDirection(prisma);
  console.log(`Corrected direction of ${directionFixedCount} change reasons`);

  const lapseReasonCount = await enrichLicenseChangeReasons(prisma);
  console.log(`Attributed ${lapseReasonCount} declarations to license expiry/suspension`);

  // ─── 6. Fee payments ───────────────────────────────────────────────────────
  const feePaymentRows = sheetRows<any>(wb, "LMS_Fee_Payments");
  console.log(`Seeding FeePayment (${feePaymentRows.length})`);
  await prisma.feePayment.createMany({
    data: feePaymentRows
      .filter((row) => carrierIdByCompanyId.has(String(row["Company ID"])))
      .map((row) => ({
        id: randomUUID(),
        carrierId: carrierIdByCompanyId.get(String(row["Company ID"]))!,
        invoiceNumber: String(row["Invoice Number"]),
        invoiceDate: asDateOrThrow(row["Invoice Date"], `FeePayment ${row["Invoice Number"]}`),
        dueDate: asDateOrThrow(row["Due Date"], `FeePayment ${row["Invoice Number"]}`),
        amount: new Prisma.Decimal(row["Amount (SAR)"]),
        amountPaid: new Prisma.Decimal(row["Amount Paid (SAR)"] ?? 0),
        paymentDate: asDate(row["Payment Date"]),
        paymentStatus: row["Payment Status"],
        paymentMethod: row["Payment Method"] ?? null,
        periodCovered: String(row["Period Covered"]),
      })),
  });

  // ─── 7. Vehicles (TGA registry) ────────────────────────────────────────────
  // ownerCompanyId points at Carrier.companyId directly (the business id), not
  // an internal uuid — no lookup needed.
  const vehicleRows = sheetRows<any>(wb, "TGA_Vehicle_Registry");
  console.log(`Seeding Vehicle (${vehicleRows.length})`);
  await prisma.vehicle.createMany({
    data: vehicleRows.map((row) => ({
      id: randomUUID(),
      plateNumber: String(row["Plate Number"]),
      plateType: row["Plate Type"] ?? null,
      ownerCompanyId: row["Owner Company ID"] != null ? String(row["Owner Company ID"]) : null,
      vehicleType: row["Vehicle Type"] ?? null,
      vehicleClassification: row["Vehicle Classification"] ?? null,
      grossWeight: row["Gross Weight (kg)"] != null ? Math.round(Number(row["Gross Weight (kg)"])) : null,
      capacity: row["Capacity (m³)"] != null ? Math.round(Number(row["Capacity (m³)"])) : null,
      registrationDate: asDate(row["Registration Date"]),
      registrationStatus: mapVehicleStatus(row["Registration Status"]),
      lastInspectionDate: asDate(row["Last Inspection Date"]),
      insuranceExpiry: asDate(row["Insurance Expiry"]),
    })),
  });

  // ─── 8. Ground truth labels (ML bootstrap training data) ──────────────────
  const groundTruthRows = sheetRows<any>(wb, "Ground_Truth_Labels");
  console.log(`Seeding GroundTruthLabel (${groundTruthRows.length})`);
  await prisma.groundTruthLabel.createMany({
    data: groundTruthRows
      .filter((row) => carrierIdByCompanyId.has(String(row["Company ID"])))
      .map((row) => ({
        id: randomUUID(),
        carrierId: carrierIdByCompanyId.get(String(row["Company ID"]))!,
        companyId: String(row["Company ID"]),
        companyName: String(row["Company Name"]),
        licenseNumber: String(row["License Number"]),
        declaredFleet: Number(row["Declared Fleet"]),
        actualFleetTga: Number(row["Actual Fleet (TGA)"]),
        fleetGap: Number(row["Fleet Gap"]),
        fleetGapPct: new Prisma.Decimal(row["Fleet Gap %"] ?? 0),
        complianceStatus: String(row["Compliance Status"]),
        underDeclarationLabel: Number(row["Under-Declaration Label"]),
        affiliatedNetworkId: row["Affiliated Network ID"] ?? null,
        inspectionOutcome: row["Inspection Outcome"] ?? null,
        inspectionDate: asDate(row["Inspection Date"]),
        inspectorNotes: row["Inspector Notes"] ?? null,
        riskTier: row["Risk Tier"] ?? null,
      })),
  });

  // ─── 9. English translations for every Arabic field seeded above ──────────
  const translationCounts = await backfillEnglishTranslations(prisma);
  console.log("Backfilled English translations:", translationCounts);

  const counts = await Promise.all([
    prisma.carrier.count(),
    prisma.companyRegistry.count(),
    prisma.shareholder.count(),
    prisma.director.count(),
    prisma.vehicle.count(),
    prisma.declaration.count(),
    prisma.feePayment.count(),
    prisma.groundTruthLabel.count(),
  ]);
  console.log("Row counts:", {
    Carrier: counts[0],
    CompanyRegistry: counts[1],
    Shareholder: counts[2],
    Director: counts[3],
    Vehicle: counts[4],
    Declaration: counts[5],
    FeePayment: counts[6],
    GroundTruthLabel: counts[7],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
