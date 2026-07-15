"use client";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * THE COLOUR PROBLEM A DONUT CREATES HERE, and how it is solved.
 * The risk ramp escalates by FILL WEIGHT, not hue — HIGH #a24e00 and MEDIUM
 * #b45309 are nearly the same burnt amber, because they were never meant to be
 * told apart by colour alone. Paint them as two solid arcs and the chart is
 * unreadable: two identical-looking wedges.
 * So the ring uses the same three WEIGHTS the bars use — solid / 50% / 25% —
 * which keeps HIGH, MEDIUM and LOW distinguishable by lightness (a channel that
 * survives every form of colour vision) and keeps the ring speaking the same
 * language as every other risk surface on the page.
 *
 * ORDINALITY — the objection that killed the previous donut — is answered by the
 * legend, not the ring: HIGH/MEDIUM/LOW are listed in severity order, top to
 * bottom, and carry the counts. The ring shows proportion; the list shows rank.
 * A pie alone discards order, which is why a pie alone was wrong.
 *
 * No charting library. Three arcs is stroke-dasharray on three circles, and the
 * colours come from the token layer as classes — so this cannot drift from the
 * palette the way the old recharts <Cell fill="#469A57"> did.
 */
const SIZE = 168;
const THICKNESS = 26;
const R = (SIZE - THICKNESS) / 2;
const CIRC = 2 * Math.PI * R;

type Tier = "HIGH" | "MEDIUM" | "LOW";

const TONES: Record<Tier, string> = {
  HIGH: "stroke-risk-high",
  MEDIUM: "stroke-risk-medium/50",
  LOW: "stroke-risk-low/25",
};

export function RiskDistributionChart({ high, medium, low }: { high: number; medium: number; low: number }) {
  const { t } = useLocale();
  const total = high + medium + low;

  const rows: { tier: Tier; value: number }[] = [
    { tier: "HIGH", value: high },
    { tier: "MEDIUM", value: medium },
    { tier: "LOW", value: low },
  ];

  // Guard the empty case before dividing: 0/0 would make every arc NaN and the
  // ring would silently render nothing rather than an honest empty state.
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  let acc = 0;

  return (
    <Card>
      <CardHeader
        title={t("dashboard.riskDistribution")}
        meta={
          total > 0 ? (
            <>
              <span dir="ltr" className="font-mono tabular-nums">
                {total.toLocaleString("en-US")}
              </span>{" "}
              {t("dashboard.riskScored")}
            </>
          ) : undefined
        }
      />

      {total === 0 ? (
        <p className="pt-3 text-body text-ink-muted">{t("dashboard.fleetGapEmpty")}</p>
      ) : (
        <div className="flex flex-col items-center gap-6 pt-4 sm:flex-row sm:items-center sm:gap-7">
          {/* ── The ring ── */}
          <div className="relative shrink-0">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-42" role="img" aria-hidden="true">
              {/* rotate -90 starts the first arc at 12 o'clock instead of 3 —
                  the ring is not mirrored under RTL because a proportion is not
                  a direction, and flipping it would imply an order it does not
                  encode. The LEGEND carries the order. */}
              <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`} fill="none" strokeWidth={THICKNESS}>
                {/* The track: makes the ring a ring even when one tier is 100%. */}
                <circle cx={SIZE / 2} cy={SIZE / 2} r={R} className="stroke-surface-sunken" />
                {rows
                  .filter((r) => r.value > 0)
                  .map((r) => {
                    const len = (pct(r.value) / 100) * CIRC;
                    const el = (
                      <circle
                        key={r.tier}
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={R}
                        className={TONES[r.tier]}
                        strokeDasharray={`${len} ${CIRC - len}`}
                        strokeDashoffset={-acc}
                      />
                    );
                    acc += len;
                    return el;
                  })}
              </g>
            </svg>
            {/* The total, in the hole. Same value/label stacking as StatCard and
                FleetGapCard — number, then its caption beneath. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span dir="ltr" className="font-mono text-metric tabular-nums text-ink">
                {total.toLocaleString("en-US")}
              </span>
              <span className="mt-0.5 text-caption text-ink-muted">{t("dashboard.riskCentre")}</span>
            </div>
          </div>

          {/* ── The legend: rank + count + share ──
                 A fixed badge column (w-24) for the same reason RecentAlerts
                 needs one: RiskBadge shrink-wraps its label, so "Medium" is
                 wider than "Low" and an intrinsic badge would leave every row
                 starting at a different x. */}
          <ul className="min-w-0 flex-1 divide-y divide-border self-stretch">
            {rows.map((r) => (
              <li key={r.tier} className="flex items-center justify-between gap-3 py-3">
                <span className="flex w-24 shrink-0 justify-start">
                  <RiskBadge tier={r.tier} />
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span dir="ltr" className="font-mono font-medium tabular-nums text-ink">
                    {r.value.toLocaleString("en-US")}
                  </span>
                  <span aria-hidden="true" className="text-caption text-ink-muted/60">
                    ·
                  </span>
                  <span dir="ltr" className="font-mono text-caption tabular-nums text-ink-muted">
                    {`${Math.round(pct(r.value))}%`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The "Model predictions, not inspection findings" caption is GONE, and
          the reason it existed is now better served. It was a 12px murmur at the
          bottom of one card, doing the whole job of separating the model's guess
          from the registry's arithmetic. ColdStartNotice now makes that case
          explicitly, at full size, directly above this ring — so repeating it
          here would state the same caveat twice within one screen, and the
          quieter copy would be the one readers weigh against the louder. One
          idea, said once, where it can actually be read.
          (dashboard.modelDisclaimer is kept in translations.ts — the analytics
          page is the natural next home for it.) */}
    </Card>
  );
}
