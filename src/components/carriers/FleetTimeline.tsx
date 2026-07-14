"use client";
import useSWR from "swr";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function FleetTimeline({ carrierId }: { carrierId: string }) {
  const { t } = useLocale();
  const { data, isLoading } = useSWR<{
    declarations: { period: string; declaredFleet: number }[];
  }>(`/api/carriers/${carrierId}/timeline`, fetcher);

  const declarations = data?.declarations ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t("carrierDetail.fleetHistory")}</h3>
      {isLoading && <p className="text-sm text-gray-400">{t("common.loading")}</p>}
      {!isLoading && declarations.length === 0 && (
        <p className="text-sm text-gray-400">{t("carrierDetail.noFleetHistory")}</p>
      )}
      {declarations.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={declarations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="declaredFleet" stroke="#469A57" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
