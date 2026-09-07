"use client";
import Link from "next/link";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { StatCard } from "@/components/shared/StatCard";
import { OutcomeForm } from "@/components/inspections/OutcomeForm";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { LocalizedDate } from "@/components/shared/LocalizedDate";
import { PageHeader, BackLink } from "@/components/ui/PageHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeField } from "@/lib/i18n/localizeField";

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
    companyNameEn?: string;
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
    <div className="max-w-2xl space-y-3">
      <PageHeader
        /* The title IS the link to the carrier profile — restored verbatim from
           the original. A "View Carrier" link in the meta row was a workaround
           for PageHeader.title being typed `string`; the prop now takes a
           ReactNode, so the affordance goes back where it was. This redesign
           does not move navigation around. <bdi> isolates the Arabic company
           name inside a possibly-English UI. */
        title={
          <Link href={`/carriers/${data.carrier.id}`} className="transition-colors hover:text-mint">
            <bdi>{localizeField(locale, data.carrier.companyName, data.carrier.companyNameEn)}</bdi>
          </Link>
        }
        back={
          <Link href="/inspections">
            <BackLink>{t("inspectionDetail.back")}</BackLink>
          </Link>
        }
        meta={
          <>
            <span dir="ltr" className="font-mono tabular-nums">
              <LocalizedDate value={data.scheduledDate} locale={locale} />
            </span>
            {data.carrier.riskTier && <RiskBadge tier={data.carrier.riskTier} />}
          </>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t("inspectionDetail.declaredFleet")} value={data.carrier.declaredFleetSize} />
        <StatCard label={t("inspectionDetail.actualFleetTga")} value={data.carrier.actualFleet} />
        <StatCard label={t("inspectionDetail.status")} value={data.status} />
      </div>

      {data.status === "COMPLETED" ? (
        <Card>
          <CardHeader title={t("inspectionDetail.result")} />
          <div className="space-y-2 pt-4 text-body">
            <p>
              <span className="text-ink-muted">{t("inspectionDetail.resultOutcome")} </span>
              {data.outcome ? OUTCOME_LABELS[data.outcome] : "—"}
            </p>
            <p>
              <span className="text-ink-muted">{t("inspectionDetail.observedFleet")} </span>
              <span dir="ltr" className="font-mono tabular-nums">
                {data.actualFleetSize ?? "—"}
              </span>
            </p>
            {data.notes && (
              <p>
                <span className="text-ink-muted">{t("inspectionDetail.notes")} </span>
                {data.notes}
              </p>
            )}
          </div>
        </Card>
      ) : (
        <OutcomeForm inspectionId={data.id} declaredFleet={data.carrier.actualFleet} />
      )}
    </div>
  );
}
