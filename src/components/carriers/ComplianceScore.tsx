"use client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { FEATURE_LABELS } from "@/lib/utils/constants";

interface Props {
  score: number; // 0-100
  riskTier: "HIGH" | "MEDIUM" | "LOW";
  factors: string[];
  factorValues?: Record<string, string>;
  confidence: number;
}

const COLOR: Record<Props["riskTier"], string> = {
  HIGH: "#DC2626",
  MEDIUM: "#F59E0B",
  LOW: "#469A57",
};

export function ComplianceScore({ score, riskTier, factors, factorValues, confidence }: Props) {
  const { t, locale } = useLocale();
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;
  const color = COLOR[riskTier];
  const labels = FEATURE_LABELS[locale];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t("carrierDetail.complianceScore")}</h3>

      <div className="flex items-center gap-8 flex-wrap">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#F3F4F6" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>
              {Math.round(score)}
            </span>
            <span className="text-xs text-gray-400" dir="ltr">
              {(confidence * 100).toFixed(0)}% {t("carrierDetail.confidenceSuffix")}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <p className="text-sm text-gray-500 mb-3">{t("carrierDetail.topFactors")}</p>
          <ol className="space-y-2">
            {factors
              .filter((f) => f)
              .map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-mwan-green/10 text-mwan-green text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span>{labels[f] ?? f}</span>
                  </span>
                  {factorValues?.[f] && (
                    <span className="font-mono text-gray-500" dir="ltr">
                      {factorValues[f]}
                    </span>
                  )}
                </li>
              ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
