import { Card } from "@/components/ui/Card";

/**
 * RESOLVES THE TWO RIVALS (this component vs the 11 hand-rolled p-4 tiles).
 * Winner: the hand-rolled tile's information order — label above value, mono
 * numerals. An instrument reads caption-then-datum, and in RTL the label anchors
 * the start.
 *
 * THE ICON CHIP IS GONE. Six colored icon chips in a row is the exact tell of a
 * consumer SaaS dashboard; the label already says what the number is;
 * AlertTriangle was doing duty for three different tiles (meaning nothing); and
 * the chip's tone->color coupling was the ONLY reason text-amber-700 was ever in
 * this file. Killing the chip kills the escape hatch at the root, not just at
 * the token layer. The `icon` prop goes with it.
 *
 * `tone` drops from 4 values to 2 — "medium"/"low" existed only to tint a chip
 * that no longer exists. Tone now colors the NUMERAL itself: exactly one tile on
 * the dashboard is text-risk-high.
 *
 * BIDI FIX: the old code put dir="ltr" on the block <p>, which re-anchored the
 * whole line to the LEFT while its label sat at the RTL start (right) — a live
 * misalignment bug. Correct pattern: the <p> follows page direction with
 * text-start, and an INNER <span dir="ltr"> isolates the digit run (per the HTML
 * spec, [dir] sets unicode-bidi: isolate). Adds the missing tabular-nums.
 *
 * Digits: always toLocaleString("en-US"), never "ar-SA" — JetBrains Mono has no
 * Arabic-Indic glyphs, so locale-formatted digits would silently fall off the
 * mono face and break column alignment.
 */
export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "high";
}) {
  return (
    <Card>
      <p className="text-caption text-ink-muted">{label}</p>
      <p className="mt-2 text-start">
        <span
          dir="ltr"
          className={`font-mono text-metric tabular-nums ${tone === "high" ? "text-risk-high" : "text-ink"}`}
        >
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </span>
      </p>
    </Card>
  );
}
