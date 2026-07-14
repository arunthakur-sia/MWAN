"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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
      <button
        onClick={retrain}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-mwan-green px-4 py-2 text-sm font-medium text-white hover:bg-mwan-green-hover disabled:opacity-50 transition-colors"
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        {loading ? t("analytics.retraining") : t("analytics.retrain")}
      </button>
      {message && <span className="text-sm text-gray-500">{message}</span>}
    </div>
  );
}
