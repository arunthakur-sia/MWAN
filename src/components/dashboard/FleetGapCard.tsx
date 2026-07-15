"use client";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * THE SIGNATURE. Dashboard-scoped, deliberately NOT a ui/ primitive — the
 * overrun geometry is specific to this one insight, and generalising it into
 * Bar would dilute both.
 *
 * PROVENANCE — this is the one number on the page that is NOT a prediction.
 * declaredFleet/actualFleet are arithmetic over two real registries (sum of
 * Carrier.declaredFleetSize vs count of related Vehicle rows), the identical
 * method src/app/api/networks/detect/route.ts:38-39 already trusts — so the
 * dashboard RECONCILES with the networks page instead of quietly contradicting
 * it. GroundTruthLabel was rejected as a source: it is seeded from a synthetic
 * sheet and carries underDeclarationLabel, the ML TRAINING TARGET. Rendering the
 * model's answer key as observed reality, on a product whose premise is that
 * risk tiers are predictions and not verdicts, would be circular and wrong.
 *
 * DIRECTION: the pipeline defines combinedGap = actual - declared. POSITIVE
 * means more trucks on the road than declared — the fraud direction. So the
 * observed fill must OVERRUN the declared outline. This is not a bar; it is a
 * bar breaking out of its box.
 *
 * The copy states a measurement and stops. "+367 vehicles beyond declared" is
 * arithmetic. It does not say under-declaration, evasion, or violation — the bar
 * reports what the two registries say; deciding what it means is the inspector's
 * job. That is the entire point of the product.
 *
 * LAYOUT — four left-aligned rows, and nothing else:
 *   1. heading + scope   2. the finding   3. the bar   4. the key
 * Every earlier attempt tried to spend the card's WIDTH on a second column, and
 * each one only moved the empty space around: the two-column split gave the
 * figures a 224px column and left the rest to the bar, so the card was tall AND
 * still half air. Left-aligned rows with the bar owning the full width is both
 * shorter and denser.
 *
 * THE GREY CHIPS ARE GONE, and their replacement fixes a real defect rather than
 * just looking better. The bar paints two colours and the card never said which
 * was which — so forest and amber were decoration, and the reader had to guess
 * that green meant "declared" and orange meant "the excess". Meanwhile Declared
 * and Actual sat in grey pills that carried no relationship to the thing they
 * described. Turning them INTO the key solves both at once: the swatch is the
 * legend, the number is the datum, and the pills disappear because the row now
 * has a job. A legend that is also the data beats a pill that is neither.
 */

/** A key entry: swatch + label + value. The swatch colour is the bar's colour —
 *  that is the entire point, so these classes must track the bar's fills. */
function Key({ tone, label, value }: { tone: string; label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`inline-block size-2 shrink-0 translate-y-[1px] rounded-[2px] ${tone}`} aria-hidden="true" />
      <span className="text-ink-muted">{label}</span>
      <Num>{value}</Num>
    </span>
  );
}

/** The operators that turn three loose figures into one equation. aria-hidden:
 *  a screen reader gets the labelled values, and "plus"/"equals" read as noise. */
function Op({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden="true" className="text-ink-muted/60">
      {children}
    </span>
  );
}

/** dir="ltr" isolates the digit run so it cannot reorder inside RTL text. */
function Num({ children }: { children: React.ReactNode }) {
  return (
    <span dir="ltr" className="font-mono tabular-nums text-ink">
      {children}
    </span>
  );
}

export function FleetGapCard({
  declaredFleet,
  actualFleet,
  carriersWithGap,
}: {
  declaredFleet: number;
  actualFleet: number;
  carriersWithGap: number;
}) {
  const { t } = useLocale();

  const max = Math.max(declaredFleet, actualFleet) || 1;
  const declaredPct = (declaredFleet / max) * 100;
  const actualPct = (actualFleet / max) * 100;
  const overrun = actualFleet - declaredFleet;
  const isEmpty = declaredFleet === 0 && actualFleet === 0;

  return (
    <Card>
      {/* 1 — TITLE BLOCK, via the shared CardHeader so every box's top edge is
             built the same way. hero=true: this card is the thesis and takes
             text-h2 while the others take text-h3 — that one step IS the page's
             hierarchy. */}
      <CardHeader
        hero
        title={t("dashboard.fleetGapTitle")}
        meta={
          !isEmpty ? (
            <>
              <Num>{carriersWithGap.toLocaleString("en-US")}</Num> {t("dashboard.fleetGapCarriers")}
            </>
          ) : undefined
        }
      />

      {/* 2 — METRIC BLOCK. The label goes UNDER the number, not beside it.
             Beside, the two competed: at 14px muted it looked like a weak
             afterthought, and at 18px ink it looked like a second, unrelated
             element — which is why neither size fixed it. The problem was never
             size, it was RELATIONSHIP. Stacked and left-aligned to the same edge,
             the number and its caption read as one unit, and it matches
             StatCard's own value/label pairing so the page speaks one language. */}
      <div className="mt-4">
        {overrun > 0 ? (
          <>
            <p className="font-mono text-display tabular-nums text-risk-high" dir="ltr">
              {`+${overrun.toLocaleString("en-US")}`}
            </p>
            <p className="mt-0.5 text-body text-ink-muted">{t("dashboard.fleetGapOverrun")}</p>
          </>
        ) : (
          /* No green celebration, no checkmark. Absence of a finding is not an
             achievement. */
          <p className="text-body text-ink-muted">
            {isEmpty ? t("dashboard.fleetGapEmpty") : t("dashboard.fleetGapNone")}
          </p>
        )}
      </div>

      {/* 3 — the bar, full width, at the bottom.
             No overflow-hidden (unlike Bar): layer 3 must be free to sit past the
             dashed edge. Layers paint in source order, so fills sit above the
             outline; fills are inset 2px so the dashed rule stays legible.
             The sheens are VERTICAL (180deg) on purpose — a horizontal gradient
             is a physical direction and would reverse when the locale toggles to
             en/ltr. ~7%: a light source, not a glossy 2007 gel. */}
      {!isEmpty && (
        <div className="relative mt-3.5 h-3 w-full rounded-control bg-surface-sunken shadow-groove" aria-hidden="true">
          {/* THE CLAIM — dashed outline at declared */}
          <div
            className="absolute inset-y-0 start-0 rounded-control border border-dashed border-border-strong"
            style={{ inlineSize: `${declaredPct}%` }}
          />
          {/* THE AGREEMENT — forest, 0 -> min(declared, actual) */}
          <div
            className="absolute inset-y-[2px] start-0 rounded-[3px] bg-forest bg-[linear-gradient(180deg,rgb(255_255_255/0.10)_0%,rgb(255_255_255/0)_60%)]"
            style={{ inlineSize: `${Math.min(declaredPct, actualPct)}%` }}
          />
          {/* THE DISCREPANCY — declared -> actual. Only the vehicles BEYOND the
              line are coloured: the first declaredFleet were declared
              legitimately, and colouring them would indict the entire fleet. */}
          {overrun > 0 && (
            <div
              className="absolute inset-y-[2px] rounded-[3px] bg-risk-high bg-[linear-gradient(180deg,rgb(255_255_255/0.14)_0%,rgb(255_255_255/0)_60%)] shadow-[0_1px_3px_-1px_rgb(162_78_0/0.5)]"
              style={{ insetInlineStart: `${declaredPct}%`, inlineSize: `${actualPct - declaredPct}%` }}
            />
          )}
        </div>
      )}

      {/* 4 — THE KEY, AS AN EQUATION. Without a key the bar is two colours and a
             shrug; the swatches are the bar's own fills, so this row says what
             forest is and what amber is.
             "Actual" read as a lost sibling for a precise reason: it is the only
             entry with no swatch, because it is not a run on the bar — it is
             where the bar ENDS. Giving it a swatch would invent a third colour
             that does not exist. The real fix is to state the relationship it
             already has: declared + beyond = actual. The operators turn three
             loose figures into one equation, and Actual stops being a third
             sibling and becomes the RESULT — which is also, exactly, what the
             bar draws.
             RTL: in an rtl flex row the first child renders at the inline-start
             (right), so an Arabic reader reads Declared -> + -> Beyond -> = ->
             Actual in their natural order, and the sequence still matches the
             bar's runs from its own start. No dir override needed. */}
      {!isEmpty && (
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-caption">
          <Key tone="bg-forest" label={t("carriers.declared")} value={declaredFleet.toLocaleString("en-US")} />
          {overrun > 0 && (
            <>
              <Op>+</Op>
              <Key
                tone="bg-risk-high"
                label={t("dashboard.fleetGapBeyond")}
                value={overrun.toLocaleString("en-US")}
              />
              <Op>=</Op>
              <span className="inline-flex items-baseline gap-1.5">
                <span className="text-ink-muted">{t("carriers.actual")}</span>
                <span dir="ltr" className="font-mono font-medium tabular-nums text-ink">
                  {actualFleet.toLocaleString("en-US")}
                </span>
              </span>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
