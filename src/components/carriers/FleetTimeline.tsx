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

export function FleetTimeline({ carrierId }: { carrierId: string }) {
  const { t } = useLocale();
  const { data, isLoading } = useSWR<{
    declarations: { period: string; declaredFleet: number }[];
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
              <Tooltip />
              <Line type="monotone" dataKey="declaredFleet" stroke={BRAND.forest} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
