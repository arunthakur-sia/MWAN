"use client";
import { CarrierTable } from "@/components/carriers/CarrierTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function CarriersPage() {
  const { t } = useLocale();
  return (
    <div className="space-y-3">
      <PageHeader title={t("carriers.title")} subtitle={t("carriers.subtitle")} />
      <CarrierTable />
    </div>
  );
}
