"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const STEPS: { key: string; labelKey: string; path: string }[] = [
  { key: "fleet-gap", labelKey: "dashboard.runFleetGap", path: "/api/detection/fleet-gap" },
  { key: "prediction", labelKey: "dashboard.runPrediction", path: "/api/prediction/run" },
  { key: "networks", labelKey: "dashboard.runNetworks", path: "/api/networks/detect" },
];

export function RunPipelineButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLocale();

  async function run(step: (typeof STEPS)[number]) {
    setLoading(step.key);
    try {
      await fetch(step.path, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STEPS.map((step) => (
        <button
          key={step.key}
          onClick={() => run(step)}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-lg bg-mwan-green px-4 py-2 text-sm font-medium text-white hover:bg-mwan-green-hover disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={loading === step.key ? "animate-spin" : ""} />
          {t(step.labelKey)}
        </button>
      ))}
    </div>
  );
}
