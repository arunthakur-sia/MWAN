"use client";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type RiskTier = "HIGH" | "MEDIUM" | "LOW";

const config: Record<RiskTier, { bg: string; text: string; border: string; labelKey: string }> = {
  HIGH: { bg: "bg-risk-high/10", text: "text-risk-high", border: "border-risk-high/20", labelKey: "common.riskHigh" },
  MEDIUM: {
    bg: "bg-risk-medium/10",
    text: "text-amber-700",
    border: "border-risk-medium/20",
    labelKey: "common.riskMedium",
  },
  LOW: {
    bg: "bg-mwan-green/10",
    text: "text-mwan-green-dark",
    border: "border-mwan-green/20",
    labelKey: "common.riskLow",
  },
};

export function RiskBadge({ tier }: { tier: RiskTier }) {
  const { t } = useLocale();
  const c = config[tier];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {t(c.labelKey)}
    </span>
  );
}
