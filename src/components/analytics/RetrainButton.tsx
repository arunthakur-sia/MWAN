"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";

export function RetrainButton({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useLocale();

  async function retrain() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ml/retrain", { method: "POST" });
      const data = await res.json();
      if (data.status === "insufficient_data") {
        setMessage(`${t("analytics.insufficientData")} (${data.samples} ${t("analytics.outOf50")})`);
      } else {
        setMessage(t("analytics.retrainedOk"));
        onDone();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* canvas, not primary/secondary: this button now sits on the dark
          PageHeader canvas, where a white/forest fill would be the loudest
          thing on the page. canvas is mint on a translucent lift instead. */}
      <Button variant="canvas" onClick={retrain} disabled={loading}>
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        {loading ? t("analytics.retraining") : t("analytics.retrain")}
      </Button>
      {message && <span className="text-body text-mint/80">{message}</span>}
    </div>
  );
}
