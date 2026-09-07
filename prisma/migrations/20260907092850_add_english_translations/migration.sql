-- AlterTable
ALTER TABLE "Carrier" ADD COLUMN     "city_en" TEXT,
ADD COLUMN     "region_en" TEXT;

-- AlterTable
ALTER TABLE "CompanyRegistry" ADD COLUMN     "activity_description_en" TEXT,
ADD COLUMN     "city_en" TEXT,
ADD COLUMN     "company_name_en" TEXT,
ADD COLUMN     "legal_form_en" TEXT,
ADD COLUMN     "region_en" TEXT,
ADD COLUMN     "registered_address_en" TEXT;

-- AlterTable
ALTER TABLE "Director" ADD COLUMN     "name_en" TEXT,
ADD COLUMN     "position_en" TEXT;

-- AlterTable
ALTER TABLE "OwnershipNetwork" ADD COLUMN     "primary_owner_name_en" TEXT,
ADD COLUMN     "shared_address_en" TEXT;

-- AlterTable
ALTER TABLE "Shareholder" ADD COLUMN     "name_en" TEXT,
ADD COLUMN     "role_en" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "plate_type_en" TEXT,
ADD COLUMN     "vehicle_classification_en" TEXT,
ADD COLUMN     "vehicle_type_en" TEXT;
