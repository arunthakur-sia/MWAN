"use client";
import Link from "next/link";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { OutcomeForm } from "@/components/inspections/OutcomeForm";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export interface InspectionDetailData {
  id: string;
  scheduledDate: string;
  status: string;
  outcome: string | null;
  actualFleetSize: number | null;
  notes: string | null;
  carrier: {
    id: string;
    companyName: string;
    declaredFleetSize: number;
    actualFleet: number;
    riskTier: "HIGH" | "MEDIUM" | "LOW" | null;
  };
}

export function InspectionDetailView({ data }: { data: InspectionDetailData }) {
  const { t, locale } = useLocale();

  const OUTCOME_LABELS: Record<string, string> = {
    CONFIRMED_UNDER_DECLARATION: t("inspectionDetail.outcomeConfirmed"),
    NO_VIOLATION_FOUND: t("inspectionDetail.outcomeNoViolation"),
    PARTIAL_VIOLATION: t("inspectionDetail.outcomePartial"),
    NETWORK_FRAGMENTATION_DETECTED: t("inspectionDetail.outcomeNetworkFragmentation"),
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/inspections" className="text-sm text-mwan-green hover:underline">
          ← {t("inspectionDetail.back")}
        </Link>
        <h1 className="text-2xl font-semibold text-mwan-charcoal mt-1">
          <Link href={`/carriers/${data.carrier.id}`} className="hover:text-mwan-green">
            {data.carrier.companyName}
          </Link>
        </h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span dir="ltr">{new Date(data.scheduledDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</span>
          {data.carrier.riskTier && <RiskBadge tier={data.carrier.riskTier} />}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("inspectionDetail.declaredFleet")}</p>
          <p className="text-xl font-bold font-mono" dir="ltr">
            {data.carrier.declaredFleetSize}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("inspectionDetail.actualFleetTga")}</p>
          <p className="text-xl font-bold font-mono" dir="ltr">
            {data.carrier.actualFleet}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("inspectionDetail.status")}</p>
          <p className="text-xl font-bold">{data.status}</p>
        </div>
      </div>

      {data.status === "COMPLETED" ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-2">
          <h3 className="text-lg font-semibold">{t("inspectionDetail.result")}</h3>
          <p className="text-sm">
            <span className="text-gray-500">{t("inspectionDetail.resultOutcome")} </span>
            {data.outcome ? OUTCOME_LABELS[data.outcome] : "—"}
          </p>
          <p className="text-sm">
            <span className="text-gray-500">{t("inspectionDetail.observedFleet")} </span>
            <span className="font-mono" dir="ltr">
              {data.actualFleetSize ?? "—"}
            </span>
          </p>
          {data.notes && (
            <p className="text-sm">
              <span className="text-gray-500">{t("inspectionDetail.notes")} </span>
              {data.notes}
            </p>
          )}
        </div>
      ) : (
        <OutcomeForm inspectionId={data.id} declaredFleet={data.carrier.actualFleet} />
      )}
    </div>
  );
}
