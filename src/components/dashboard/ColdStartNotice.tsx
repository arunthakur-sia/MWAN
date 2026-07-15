"use client";
import { TriangleAlert } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * The honesty banner: the page's scores are a queue, not a judgement.
 *
 * THE THRESHOLD IS NOT A MAGIC NUMBER. 50 mirrors ml-service/app.py:324, which
 * refuses to retrain below it:
 *   SELECT COUNT(*) FROM "Inspection" WHERE status='COMPLETED' AND outcome IS NOT NULL
 * The count fed to this component MUST be that same query (see src/app/page.tsx),
 * or the bar measures one thing and the gate enforces another — a progress bar
 * that fills to a line the system does not actually use.
 *
 * THIS DUPLICATION IS A KNOWN OBJECTION, NOT AN OVERSIGHT. Commit 0057f35
 * ("Replace retrain-threshold stat with inspections since last prediction run")
 * deleted an earlier hardcoded RETRAIN_THRESHOLD for a correct reason: the
 * constant is OWNED by ml-service, and a copy in the frontend can drift out of
 * sync with it. That reasoning still stands. The number is back only because a
 * progress bar cannot draw a target it does not know, and the mitigation is that
 * the drift is no longer silent — the two constants are diffed mechanically by
 * the repo's design validator, so divergence fails a check instead of quietly
 * mis-measuring. The proper fix is for ml-service to expose the threshold over
 * its API (/retrain already returns `samples` but not the bar it is judged
 * against); when it does, delete this constant and read it from there.
 *
 * WHY THERE ARE TWO STATES, and why this is not gold-plating: the banner as
 * specced counts UP to 50 and says "real-world learning begins once 50 outcomes
 * are logged". Against the live registry that sentence is already false — there
 * are 58. Shipping the single cold-start state would have hardcoded a claim the
 * database contradicts. So the component reads the real count and says the true
 * thing in either world:
 *   confirmed <  50  ->  progress toward the gate ("12 / 50")
 *   confirmed >= 50  ->  the gate is MET and the active model still predates it
 * The second state is the one that renders today, and it is the more urgent
 * message: the outcomes exist, nobody has retrained on them.
 *
 * COLOUR. --surface-notice, NOT --risk-medium-tint. Reusing the RiskBadge chip
 * tint here was wrong and read as "too bright yellow": that value is tuned for a
 * ~60px chip, and the same chroma across a full-width banner reads as a yellow
 * field (the area effect — see the token's note in globals.css). The notice
 * surface carries 39% less chroma at the same lightness, which is where the
 * yellow actually lived. Measured: title 15.83, body 6.14, accent 4.84.
 * NOT --brand-amber (#ff8b00): 2.21 here. globals.css marks it DISPLAY ONLY, and
 * this is the surface that proves why.
 * The AMBER now lives only in the small deliberate marks — icon, bar, counter —
 * rather than in the field behind them. On a dark canvas the panel already
 * separates at ~12:1, so the field never needed to do that work.
 *
 * NO RED, and the restraint is the point: a red banner would make the model's
 * uncertainty look like an incident. It is a caveat, not an alarm.
 */
const RETRAIN_THRESHOLD = 50;

export function ColdStartNotice({ confirmedOutcomes }: { confirmedOutcomes: number }) {
  const { t } = useLocale();
  const met = confirmedOutcomes >= RETRAIN_THRESHOLD;
  const pct = Math.min(100, (confirmedOutcomes / RETRAIN_THRESHOLD) * 100);

  return (
    <section
      // /15 not /20: with the field dialled back, the border was the next
      // loudest warm thing on the card. It only needs to close the shape.
      className="rounded-card border border-risk-medium/15 bg-surface-notice p-5 shadow-card"
      aria-labelledby="cold-start-title"
    >
      <div className="flex items-start gap-3.5">
        {/* The plate INVERTED when the field was dialled back, and the result is
            tidier than what it replaced. It used to be a white plate lifted off
            a cream field; with the field now near-white, a white plate is
            invisible against it (1.03:1). So the plate takes the CHIP tint —
            --risk-medium-tint, used here at exactly the ~36px scale it was tuned
            for — and the field takes the large-surface token. Each value now
            does the job its chroma was chosen for.
            The hairline border is what makes the plate legible at 1.03 against
            the field; no shadow, because this is a mark on a card, not a card. */}
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-control border border-risk-medium/15 bg-risk-medium-tint text-risk-medium"
        >
          <TriangleAlert size={17} />
        </span>

        <div className="min-w-0 flex-1">
          <h2 id="cold-start-title" className="text-h2 text-ink">
            {t("dashboard.coldStartTitle")}
          </h2>
          {/* max-w-prose: this is the longest prose on the page, and a measure
              that runs the full card width is unreadable at this size. */}
          <p className="mt-1 max-w-prose text-body text-ink-muted">
            {met ? t("dashboard.coldStartBodyMet") : t("dashboard.coldStartBody")}
          </p>

          {/* The counter. Not decoration — it is the one number that says how
              close the model is to learning from reality, so it gets the mono
              face every other datum on this page gets. */}
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {/* The track is a groove, same as every other track in the system.
                w-56 not w-full: a bar that spans the whole card implies the
                prose above is what is progressing. It is a small instrument. */}
            <div
              className="h-1.5 w-56 max-w-full overflow-hidden rounded-control bg-risk-medium/15 shadow-groove"
              role="progressbar"
              aria-valuenow={Math.min(confirmedOutcomes, RETRAIN_THRESHOLD)}
              aria-valuemin={0}
              aria-valuemax={RETRAIN_THRESHOLD}
              aria-labelledby="cold-start-title"
            >
              {/* inset-inline-start via `start-0` is implicit here — the fill is a
                  block in flow, so it grows from the inline start in BOTH
                  directions with no physical property involved. A 180deg sheen,
                  never 90deg: a horizontal gradient would reverse under RTL. */}
              <div
                className="h-full rounded-control bg-risk-medium bg-[linear-gradient(180deg,rgb(255_255_255/0.18)_0%,rgb(255_255_255/0)_70%)]"
                style={{ inlineSize: `${pct}%` }}
              />
            </div>
            <p className="text-caption font-semibold text-risk-medium">
              <span dir="ltr" className="font-mono tabular-nums">
                {met
                  ? confirmedOutcomes.toLocaleString("en-US")
                  : `${confirmedOutcomes.toLocaleString("en-US")} / ${RETRAIN_THRESHOLD}`}
              </span>{" "}
              {met ? t("dashboard.coldStartOutcomesMet") : t("dashboard.coldStartOutcomes")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
