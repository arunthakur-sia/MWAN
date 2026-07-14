-- DropIndex
DROP INDEX "Carrier_license_number_key";

-- DropIndex
DROP INDEX "Vehicle_plate_number_key";

-- CreateIndex
CREATE INDEX "Carrier_license_number_idx" ON "Carrier"("license_number");

-- CreateIndex
CREATE INDEX "Vehicle_plate_number_idx" ON "Vehicle"("plate_number");
