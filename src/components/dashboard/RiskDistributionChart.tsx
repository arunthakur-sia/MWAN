"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const COLORS = { high: "#DC2626", medium: "#F59E0B", low: "#469A57" };

export function RiskDistributionChart({ high, medium, low }: { high: number; medium: number; low: number }) {
  const { t } = useLocale();
  const data = [
    { key: "high", name: t("common.riskHigh"), value: high },
    { key: "medium", name: t("common.riskMedium"), value: medium },
    { key: "low", name: t("common.riskLow"), value: low },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t("dashboard.riskDistribution")}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
