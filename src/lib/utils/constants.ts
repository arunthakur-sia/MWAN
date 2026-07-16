export const RISK_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40,
} as const;

export function scoreToRiskTier(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= RISK_THRESHOLDS.HIGH) return "HIGH";
  if (score >= RISK_THRESHOLDS.MEDIUM) return "MEDIUM";
  return "LOW";
}

// Sort weight for surfacing HIGH risk first wherever alerts/carriers are ranked by severity.
export const RISK_TIER_ORDER: Record<"HIGH" | "MEDIUM" | "LOW", number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

// Composite score weights — blends today's fleet gap, the ML forward-looking
// prediction, and hidden-ownership network risk (spec section 3.4).
export const SCORE_WEIGHTS = {
  fleetGap: 0.4,
  prediction: 0.4,
  network: 0.2,
} as const;

// ComplianceScore.topFactor1/2/3 store the raw feature key (e.g. "fleet_gap_pct")
// so the UI can translate it per-locale at render time — see FEATURE_LABELS below.
export const FEATURE_LABELS: Record<"ar" | "en", Record<string, string>> = {
  ar: {
    fleet_gap: "فجوة الأسطول",
    fleet_gap_pct: "نسبة الفجوة",
    actual_fleet_tga: "الأسطول الفعلي",
    declared_fleet_size: "حجم الأسطول المعلن",
    payment_compliance_rate: "الالتزام بالدفع",
    overdue_count: "فواتير متأخرة",
    partial_payment_ratio: "نسبة الدفع الجزئي",
    declaration_trend_6q: "اتجاه التصريح",
    ownership_complexity: "تعقيد الملكية",
    network_membership: "شبكة ملكية مشتركة",
  },
  en: {
    fleet_gap: "Fleet gap",
    fleet_gap_pct: "Fleet gap %",
    actual_fleet_tga: "Actual fleet (TGA)",
    declared_fleet_size: "Declared fleet size",
    payment_compliance_rate: "Payment compliance rate",
    overdue_count: "Overdue invoices",
    partial_payment_ratio: "Partial payment ratio",
    declaration_trend_6q: "Declaration trend",
    ownership_complexity: "Ownership complexity",
    network_membership: "Shared ownership network",
  },
};

export const MODEL_VERSION_FALLBACK = "v1.0";
