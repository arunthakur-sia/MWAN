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

// One-line explanation shown when a user expands a contributing factor —
// keyed the same way as FEATURE_LABELS.
export const FEATURE_DESCRIPTIONS: Record<"ar" | "en", Record<string, string>> = {
  ar: {
    fleet_gap: "الفرق بين حجم الأسطول المُصرَّح به وعدد المركبات المرصودة فعليًا على الشبكة.",
    fleet_gap_pct: "نسبة مركبات الأسطول غير المُصرَّح بها. الفجوة الصغيرة لا تعني دائمًا خطورة أقل. فبالنسبة لناقل يملك عددًا قليلًا من المركبات، قد تعني فجوة صغيرة أن جزءًا كبيرًا من الأسطول غير مسجل.",
    actual_fleet_tga: "عدد المركبات المرصودة فعليًا وهي تعمل على شبكة TGA.",
    declared_fleet_size: "عدد المركبات التي صرّح بها الناقل رسميًا للجهة التنظيمية.",
    payment_compliance_rate: "نسبة الفواتير التي سددها الناقل في موعدها.",
    overdue_count: "عدد الفواتير المتأخرة عن السداد حاليًا.",
    partial_payment_ratio: "نسبة الفواتير التي سُددت جزئيًا فقط وليس بالكامل.",
    declaration_trend_6q: "اتجاه حجم الأسطول المعلن للناقل خلال آخر 6 أرباع.",
    ownership_complexity: "مدى تعقيد أو غموض هيكل ملكية الناقل.",
    network_membership: "ما إذا كان الناقل يشترك في روابط ملكية مع ناقلين آخرين ضمن شبكة.",
  },
  en: {
    fleet_gap: "Difference between the carrier's declared fleet size and vehicles actually observed on the network.",
    fleet_gap_pct: "Share of the carrier's fleet that's undeclared. A small gap doesn't always mean lower risk. For a carrier with few vehicles, even a small gap can mean a large portion of the fleet is missing.",
    actual_fleet_tga: "Number of vehicles actually observed operating on the TGA network.",
    declared_fleet_size: "Number of vehicles the carrier has officially declared to the regulator.",
    payment_compliance_rate: "Share of invoices the carrier has paid on time.",
    overdue_count: "Number of invoices currently overdue for payment.",
    partial_payment_ratio: "Share of invoices paid only partially rather than in full.",
    declaration_trend_6q: "Direction of the carrier's declared fleet size over the last 6 quarters.",
    ownership_complexity: "How layered or opaque the carrier's ownership structure is.",
    network_membership: "Whether the carrier shares ownership ties with other carriers in a network.",
  },
};

export const MODEL_VERSION_FALLBACK = "v1.0";
