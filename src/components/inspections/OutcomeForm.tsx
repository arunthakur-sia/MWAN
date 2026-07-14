"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function OutcomeForm({ inspectionId, declaredFleet }: { inspectionId: string; declaredFleet: number }) {
  const [outcome, setOutcome] = useState("");
  const [actualFleetSize, setActualFleetSize] = useState(String(declaredFleet));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useLocale();

  const OUTCOMES = [
    { value: "CONFIRMED_UNDER_DECLARATION", label: t("inspectionDetail.outcomeConfirmed") },
    { value: "NO_VIOLATION_FOUND", label: t("inspectionDetail.outcomeNoViolation") },
    { value: "PARTIAL_VIOLATION", label: t("inspectionDetail.outcomePartial") },
    { value: "NETWORK_FRAGMENTATION_DETECTED", label: t("inspectionDetail.outcomeNetworkFragmentation") },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!outcome) return;
    setSubmitting(true);
    try {
      await fetch(`/api/inspections/${inspectionId}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          actualFleetSize: actualFleetSize ? Number(actualFleetSize) : null,
          notes: notes || null,
        }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold">{t("inspectionDetail.result")}</h3>

      <div>
        <label className="block text-sm text-gray-500 mb-2">{t("inspectionDetail.outcomeLabel")}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {OUTCOMES.map((o) => (
            <button
              type="button"
              key={o.value}
              onClick={() => setOutcome(o.value)}
              className={`text-sm text-start px-3 py-2 rounded-lg border transition-colors ${
                outcome === o.value
                  ? "bg-mwan-green/10 text-mwan-green border-mwan-green/30"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-2">{t("inspectionDetail.actualFleetObservedLabel")}</label>
        <input
          type="number"
          min={0}
          value={actualFleetSize}
          onChange={(e) => setActualFleetSize(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-mono"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-2">{t("inspectionDetail.inspectorNotesLabel")}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!outcome || submitting}
        className="rounded-lg bg-mwan-green px-4 py-2 text-sm font-medium text-white hover:bg-mwan-green-hover disabled:opacity-50 transition-colors"
      >
        {submitting ? t("inspectionDetail.savingResult") : t("inspectionDetail.saveResult")}
      </button>
    </form>
  );
}
