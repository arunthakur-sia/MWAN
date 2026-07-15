"use client";
import { InspectionQueue } from "@/components/inspections/InspectionQueue";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function InspectionsPage() {
  const { t } = useLocale();
  return (
    <div className="space-y-3">
      <PageHeader title={t("inspections.title")} subtitle={t("inspections.subtitle")} />
      <InspectionQueue />
    </div>
  );
}
