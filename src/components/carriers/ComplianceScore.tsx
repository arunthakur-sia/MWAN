"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { FEATURE_LABELS, FEATURE_DESCRIPTIONS } from "@/lib/utils/constants";

interface Props {
  score: number; // 0-100
  riskTier: "HIGH" | "MEDIUM" | "LOW";
  factors: string[];
  factorValues?: Record<string, string>;
  confidence: number;
}

/**
 * Same fix as RiskDistributionChart, for the same reason: HIGH/MEDIUM's burnt
 * ambers are nearly indistinguishable as two solid strokes, so the ramp
 * escalates by FILL WEIGHT (solid / 50% / 25%), not hue. Tailwind stroke
 * classes, not tokens.ts — this is inline SVG in JSX, so classes work.
 */
const TONE: Record<Props["riskTier"], string> = {
  HIGH: "stroke-risk-high",
  MEDIUM: "stroke-risk-medium/50",
  LOW: "stroke-risk-low/25",
};

export function ComplianceScore({ score, riskTier, factors, factorValues, confidence }: Props) {
  const { t, locale } = useLocale();
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;
  const labels = FEATURE_LABELS[locale];
  const descriptions = FEATURE_DESCRIPTIONS[locale];
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader title={t("carrierDetail.complianceScore")} />

      <div className="flex items-center gap-8 flex-wrap pt-4">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" className="stroke-surface-sunken" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              className={TONE[riskTier]}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
            />
          </svg>
          {/* The tier is already stated by the RiskBadge in the page header, so
              the number is NOT tier-coloured — that would be the same fact
              (score -> tier bucket) encoded a third time. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span dir="ltr" className="font-mono text-metric tabular-nums text-ink">
              {Math.round(score)}
            </span>
            <span dir="ltr" className="text-caption text-ink-muted">
              {(confidence * 100).toFixed(0)}% {t("carrierDetail.confidenceSuffix")}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <p className="text-body text-ink-muted mb-3">{t("carrierDetail.topFactors")}</p>
          <ol className="space-y-1">
            {factors
              .filter((f) => f)
              .map((f, i) => {
                const isOpen = expanded === i;
                const description = descriptions[f];
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      disabled={!description}
                      className="w-full flex items-center justify-between gap-2 text-body py-1 text-start disabled:cursor-default"
                    >
                      <span className="flex items-center gap-2">
                        <span className="size-5 shrink-0 rounded-control bg-surface-sunken text-caption font-semibold text-ink-muted flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-ink">{labels[f] ?? f}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {factorValues?.[f] && (
                          <span dir="ltr" className="font-mono tabular-nums text-ink-muted">
                            {factorValues[f]}
                          </span>
                        )}
                        {description && (
                          <ChevronDown
                            className={`size-4 shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </span>
                    </button>
                    {isOpen && description && (
                      <p className="text-caption text-ink-muted ps-7 pb-2">{description}</p>
                    )}
                  </li>
                );
              })}
          </ol>
        </div>
      </div>
    </Card>
  );
}
