"use client";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type RiskTier = "HIGH" | "MEDIUM" | "LOW";

/**
 * The ramp as a chip: escalation by FILL WEIGHT, not hue.
 *
 * rounded-full -> rounded-control (5px). Pills read consumer; a clipped
 * rectangle reads like a register entry.
 *
 * HIGH loses its border — a solid chip needs no outline, and dropping it widens
 * the weight gap to MEDIUM, which is the whole point of the ramp.
 *
 * LOW has no background at all. It is outline-only and it recedes ON PURPOSE.
 * That is not an oversight to be "fixed" later.
 *
 * text-amber-700 is gone: MEDIUM now uses text-risk-medium-dark, a real token.
 */
const BASE = "inline-flex items-center rounded-control px-2 py-0.5 text-caption font-medium";

const config: Record<RiskTier, { classes: string; labelKey: string }> = {
  HIGH: { classes: "bg-risk-high text-white", labelKey: "common.riskHigh" }, // 5.79
  MEDIUM: {
    classes: "bg-risk-medium-tint text-risk-medium-dark border border-risk-medium/30", // 4.76
    labelKey: "common.riskMedium",
  },
  LOW: { classes: "text-risk-low border border-risk-low/40", labelKey: "common.riskLow" }, // 6.38
};

export function RiskBadge({ tier }: { tier: RiskTier }) {
  const { t } = useLocale();
  const c = config[tier];
  return <span className={`${BASE} ${c.classes}`}>{t(c.labelKey)}</span>;
}
