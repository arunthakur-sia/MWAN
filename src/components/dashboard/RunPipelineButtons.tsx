"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const STEPS: { key: string; labelKey: string; path: string }[] = [
  { key: "fleet-gap", labelKey: "dashboard.runFleetGap", path: "/api/detection/fleet-gap" },
  { key: "prediction", labelKey: "dashboard.runPrediction", path: "/api/prediction/run" },
  { key: "networks", labelKey: "dashboard.runNetworks", path: "/api/networks/detect" },
];

/**
 * DEMOTED TO SECONDARY. Three filled buttons shouting from the top-right was the
 * loudest thing on a page whose loudest thing should be the gap. These are
 * maintenance actions — a regulator runs them occasionally; they are not the
 * job. Demoting them costs nothing and buys the entire boldness budget for the
 * signature.
 */
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
        /* `canvas`, not `secondary`: on the dark ground a white-filled chip is
           the LOUDEST thing available and would silently re-promote these
           maintenance actions back to primary — which is exactly what demoting
           them was meant to prevent. Mint on a translucent lift keeps them quiet. */
        <Button key={step.key} variant="canvas" onClick={() => run(step)} disabled={loading !== null}>
          <RefreshCw size={14} className={loading === step.key ? "animate-spin motion-reduce:animate-none" : ""} />
          {t(step.labelKey)}
        </Button>
      ))}
    </div>
  );
}
