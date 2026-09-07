"use client";
import useSWR from "swr";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { BRAND, INK } from "@/lib/design/tokens";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface DeclarationPoint {
  period: string;
  declaredFleet: number;
  changeVsPrior: number;
  changeReason: string | null;
}

// Raw values stored in Declaration.changeReason -> carrierDetail.fleetChangeReasons.* key.
const CHANGE_REASON_KEYS: Record<string, string> = {
  "Seasonal adjustment": "seasonalAdjustment",
  "No change": "noChange",
  "Fleet expansion": "fleetExpansion",
  "Merger/acquisition": "mergerAcquisition",
  "New contract": "newContract",
  "Vehicle decommissioned": "vehicleDecommissioned",
  "Vehicle transferred": "vehicleTransferred",
  "License expired": "licenseExpired",
  "License suspended": "licenseSuspended",
};

function FleetTooltip({
  active,
  payload,
  t,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  t: (key: string) => string;
}) {
  const point = payload?.[0]?.payload as DeclarationPoint | undefined;
  if (!active || !point) return null;
  const reasonKey = point.changeReason ? CHANGE_REASON_KEYS[point.changeReason] : null;
  const reasonLabel = reasonKey ? t(`carrierDetail.fleetChangeReasons.${reasonKey}`) : point.changeReason;
  const isLapse = reasonKey === "licenseExpired" || reasonKey === "licenseSuspended";

  return (
    <div className="rounded-card border border-border bg-surface p-3 shadow-card-lift text-caption max-w-[220px]">
      <p className="text-body font-semibold text-ink">{point.period}</p>
      <p className="mt-1 text-ink-muted">
        {t("carrierDetail.declaredFleet")}:{" "}
        <span dir="ltr" className="font-mono tabular-nums text-ink">
          {point.declaredFleet}
        </span>
      </p>
      {point.changeVsPrior !== 0 && (
        <p className={point.changeVsPrior > 0 ? "text-forest" : "text-risk-high"}>
          <span dir="ltr" className="font-mono tabular-nums">
            {point.changeVsPrior > 0 ? `+${point.changeVsPrior}` : point.changeVsPrior}
          </span>{" "}
          {t("carrierDetail.vsPriorQuarter")}
        </p>
      )}
      {reasonLabel && (
        <p className={`mt-1 ${isLapse ? "text-risk-high font-medium" : "text-ink-muted"}`}>
          {t("carrierDetail.reasonLabel")}: {reasonLabel}
        </p>
      )}
    </div>
  );
}

export function FleetTimeline({ carrierId }: { carrierId: string }) {
  const { t } = useLocale();
  const { data, isLoading } = useSWR<{
    declarations: DeclarationPoint[];
  }>(`/api/carriers/${carrierId}/timeline`, fetcher);

  const declarations = data?.declarations ?? [];

  return (
    <Card>
      <CardHeader title={t("carrierDetail.fleetHistory")} />
      <div className="pt-4">
        {isLoading && <Skeleton className="h-[220px] w-full" />}
        {!isLoading && declarations.length === 0 && <EmptyState>{t("carrierDetail.noFleetHistory")}</EmptyState>}
        {declarations.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={declarations}>
              <CartesianGrid strokeDasharray="3 3" stroke={INK.border} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={({ active, payload }) => <FleetTooltip active={active} payload={payload} t={t} />} />
              <Line type="monotone" dataKey="declaredFleet" stroke={BRAND.forest} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
