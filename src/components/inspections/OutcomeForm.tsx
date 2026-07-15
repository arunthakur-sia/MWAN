"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

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
    <form onSubmit={submit}>
      <Card>
        <CardHeader title={t("inspectionDetail.result")} />

        <div className="space-y-4 pt-4">
          {/*
           * NOT a SegmentedControl: these are 4 long Arabic labels laid out in a
           * `grid sm:grid-cols-2`, not a compact one-line row of short chips.
           * SegmentedControl's inline-flex track sizes itself to its content and
           * assumes short, similarly-sized labels in a single line — forcing 4
           * long outcome sentences into that track would either overflow the
           * track or force-truncate the very text a regulator needs to read in
           * full. So the grid stays, restyled as selectable cards: a real radio
           * group (role="radiogroup" + sr-only inputs, same pattern as
           * SegmentedControl) with selection carried by border + recess instead
           * of the `bg-mwan-green/10 text-mwan-green border-mwan-green/30` tint.
           */}
          <div role="radiogroup" aria-label={t("inspectionDetail.outcomeLabel")}>
            <p className="mb-1.5 text-caption font-medium text-ink-muted">{t("inspectionDetail.outcomeLabel")}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OUTCOMES.map((o) => {
                const active = outcome === o.value;
                return (
                  <label
                    key={o.value}
                    className={`cursor-pointer rounded-control border p-3 text-start text-body transition-colors duration-150 motion-reduce:transition-none ${
                      active
                        ? "border-forest bg-surface-sunken shadow-groove text-ink"
                        : "border-border text-ink-muted hover:border-border-strong"
                    }`}
                  >
                    {/* sr-only, not hidden: a hidden input is unfocusable and
                        would take the keyboard support with it. */}
                    <input
                      type="radio"
                      name="outcome"
                      value={o.value}
                      checked={active}
                      onChange={() => setOutcome(o.value)}
                      className="sr-only"
                    />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </div>

          <Field id="actualFleetSize" label={t("inspectionDetail.actualFleetObservedLabel")}>
            <Input
              id="actualFleetSize"
              type="number"
              min={0}
              value={actualFleetSize}
              onChange={(e) => setActualFleetSize(e.target.value)}
              dir="ltr"
              className="font-mono"
            />
          </Field>

          <Field id="inspectorNotes" label={t("inspectionDetail.inspectorNotesLabel")}>
            <Textarea id="inspectorNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </Field>

          <Button variant="primary" type="submit" disabled={submitting || !outcome}>
            {submitting ? t("inspectionDetail.savingResult") : t("inspectionDetail.saveResult")}
          </Button>
        </div>
      </Card>
    </form>
  );
}
