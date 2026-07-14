-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'OVERDUE');

-- CreateEnum
CREATE TYPE "RiskTier" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionOutcome" AS ENUM ('CONFIRMED_UNDER_DECLARATION', 'NO_VIOLATION_FOUND', 'PARTIAL_VIOLATION', 'NETWORK_FRAGMENTATION_DETECTED');

-- CreateTable
CREATE TABLE "Carrier" (
    "id" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_name_en" TEXT,
    "company_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "cr_number" TEXT,
    "license_status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "license_type" TEXT NOT NULL DEFAULT 'TRANSPORT',
    "service_type" TEXT NOT NULL,
    "declared_fleet_size" INTEGER NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "last_renewal_date" TIMESTAMP(3),
    "email" TEXT,
    "mobile" TEXT,
    "city" TEXT,
    "region" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Declaration" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "declared_fleet" INTEGER NOT NULL,
    "change_vs_prior" INTEGER NOT NULL DEFAULT 0,
    "change_reason" TEXT,
    "declaration_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePayment" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL,
    "payment_date" TIMESTAMP(3),
    "payment_status" "PaymentStatus" NOT NULL,
    "payment_method" TEXT,
    "period_covered" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRegistry" (
    "id" TEXT NOT NULL,
    "cr_number" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "legal_form" TEXT,
    "incorporation_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "registered_address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "capital" DECIMAL(15,2),
    "activity_description" TEXT,
    "parent_company_cr" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shareholder" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "national_id" TEXT NOT NULL,
    "shareholder_type" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "ownership_pct" DECIMAL(5,2) NOT NULL,
    "role" TEXT,
    "start_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shareholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Director" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "national_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "appointed_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Director_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "plate_type" TEXT,
    "owner_company_id" TEXT,
    "vehicle_type" TEXT,
    "vehicle_classification" TEXT,
    "gross_weight" INTEGER,
    "capacity" INTEGER,
    "registration_date" TIMESTAMP(3),
    "registration_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "last_inspection_date" TIMESTAMP(3),
    "insurance_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceScore" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "overall_score" DECIMAL(5,2) NOT NULL,
    "fleet_gap_score" DECIMAL(5,2) NOT NULL,
    "prediction_score" DECIMAL(5,2) NOT NULL,
    "network_risk_score" DECIMAL(5,2) NOT NULL,
    "risk_tier" "RiskTier" NOT NULL,
    "prediction_confidence" DECIMAL(5,4) NOT NULL,
    "top_factor_1" TEXT NOT NULL,
    "top_factor_2" TEXT NOT NULL,
    "top_factor_3" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnershipNetwork" (
    "id" TEXT NOT NULL,
    "network_name" TEXT,
    "primary_owner_id" TEXT NOT NULL,
    "primary_owner_name" TEXT NOT NULL,
    "member_count" INTEGER NOT NULL,
    "total_declared" INTEGER NOT NULL,
    "total_actual" INTEGER NOT NULL,
    "combined_gap" INTEGER NOT NULL,
    "shared_address" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "OwnershipNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkMembership" (
    "id" TEXT NOT NULL,
    "network_id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "NetworkMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "inspector_name" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "outcome" "InspectionOutcome",
    "actual_fleet_size" INTEGER,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" "RiskTier" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" TEXT NOT NULL,
    "model_type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "accuracy" DECIMAL(5,4),
    "precision" DECIMAL(5,4),
    "recall" DECIMAL(5,4),
    "f1_score" DECIMAL(5,4),
    "auc_roc" DECIMAL(5,4),
    "training_samples" INTEGER,
    "trained_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "ModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ground_truth_labels" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "declared_fleet" INTEGER NOT NULL,
    "actual_fleet_tga" INTEGER NOT NULL,
    "fleet_gap" INTEGER NOT NULL,
    "fleet_gap_pct" DECIMAL(6,2) NOT NULL,
    "compliance_status" TEXT NOT NULL,
    "under_declaration_label" INTEGER NOT NULL,
    "affiliated_network_id" TEXT,
    "inspection_outcome" TEXT,
    "inspection_date" TIMESTAMP(3),
    "inspector_notes" TEXT,
    "risk_tier" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ground_truth_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_license_number_key" ON "Carrier"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_company_id_key" ON "Carrier"("company_id");

-- CreateIndex
CREATE INDEX "Carrier_company_id_idx" ON "Carrier"("company_id");

-- CreateIndex
CREATE INDEX "Carrier_license_status_idx" ON "Carrier"("license_status");

-- CreateIndex
CREATE INDEX "Declaration_carrier_id_period_idx" ON "Declaration"("carrier_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_invoice_number_key" ON "FeePayment"("invoice_number");

-- CreateIndex
CREATE INDEX "FeePayment_carrier_id_idx" ON "FeePayment"("carrier_id");

-- CreateIndex
CREATE INDEX "FeePayment_payment_status_idx" ON "FeePayment"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRegistry_cr_number_key" ON "CompanyRegistry"("cr_number");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRegistry_company_id_key" ON "CompanyRegistry"("company_id");

-- CreateIndex
CREATE INDEX "CompanyRegistry_company_id_idx" ON "CompanyRegistry"("company_id");

-- CreateIndex
CREATE INDEX "CompanyRegistry_registered_address_idx" ON "CompanyRegistry"("registered_address");

-- CreateIndex
CREATE INDEX "Shareholder_national_id_idx" ON "Shareholder"("national_id");

-- CreateIndex
CREATE INDEX "Shareholder_company_id_idx" ON "Shareholder"("company_id");

-- CreateIndex
CREATE INDEX "Director_national_id_idx" ON "Director"("national_id");

-- CreateIndex
CREATE INDEX "Director_company_id_idx" ON "Director"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_number_key" ON "Vehicle"("plate_number");

-- CreateIndex
CREATE INDEX "Vehicle_owner_company_id_idx" ON "Vehicle"("owner_company_id");

-- CreateIndex
CREATE INDEX "Vehicle_registration_status_idx" ON "Vehicle"("registration_status");

-- CreateIndex
CREATE INDEX "ComplianceScore_carrier_id_idx" ON "ComplianceScore"("carrier_id");

-- CreateIndex
CREATE INDEX "ComplianceScore_risk_tier_idx" ON "ComplianceScore"("risk_tier");

-- CreateIndex
CREATE INDEX "ComplianceScore_computed_at_idx" ON "ComplianceScore"("computed_at");

-- CreateIndex
CREATE INDEX "OwnershipNetwork_primary_owner_id_idx" ON "OwnershipNetwork"("primary_owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "NetworkMembership_network_id_carrier_id_key" ON "NetworkMembership"("network_id", "carrier_id");

-- CreateIndex
CREATE INDEX "Inspection_carrier_id_idx" ON "Inspection"("carrier_id");

-- CreateIndex
CREATE INDEX "Inspection_status_idx" ON "Inspection"("status");

-- CreateIndex
CREATE INDEX "Alert_carrier_id_idx" ON "Alert"("carrier_id");

-- CreateIndex
CREATE INDEX "Alert_is_read_idx" ON "Alert"("is_read");

-- CreateIndex
CREATE INDEX "Alert_created_at_idx" ON "Alert"("created_at");

-- CreateIndex
CREATE INDEX "ModelVersion_model_type_is_active_idx" ON "ModelVersion"("model_type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ground_truth_labels_carrier_id_key" ON "ground_truth_labels"("carrier_id");

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shareholder" ADD CONSTRAINT "Shareholder_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "CompanyRegistry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Director" ADD CONSTRAINT "Director_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "CompanyRegistry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_owner_company_id_fkey" FOREIGN KEY ("owner_company_id") REFERENCES "Carrier"("company_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceScore" ADD CONSTRAINT "ComplianceScore_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetworkMembership" ADD CONSTRAINT "NetworkMembership_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "OwnershipNetwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetworkMembership" ADD CONSTRAINT "NetworkMembership_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ground_truth_labels" ADD CONSTRAINT "ground_truth_labels_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
