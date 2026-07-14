"use client";
import { CarrierTable } from "@/components/carriers/CarrierTable";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function CarriersPage() {
  const { t } = useLocale();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-mwan-charcoal">{t("carriers.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("carriers.subtitle")}</p>
      </div>
      <CarrierTable />
    </div>
  );
}
