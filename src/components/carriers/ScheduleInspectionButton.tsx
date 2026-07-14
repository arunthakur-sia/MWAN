"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ScheduleInspectionButton({ carrierId }: { carrierId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLocale();

  async function schedule() {
    setLoading(true);
    try {
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
      await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrierId, scheduledDate: inTwoWeeks.toISOString() }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={schedule}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-mwan-green px-4 py-2 text-sm font-medium text-white hover:bg-mwan-green-hover disabled:opacity-50 transition-colors"
    >
      <CalendarPlus size={16} />
      {loading ? t("carrierDetail.scheduling") : t("carrierDetail.scheduleInspection")}
    </button>
  );
}
