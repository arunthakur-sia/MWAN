"use client";
import { InspectionQueue } from "@/components/inspections/InspectionQueue";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function InspectionsPage() {
  const { t } = useLocale();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-mwan-charcoal">{t("inspections.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("inspections.subtitle")}</p>
      </div>
      <InspectionQueue />
    </div>
  );
}
