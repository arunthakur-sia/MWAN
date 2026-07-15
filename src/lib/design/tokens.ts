/**
 * THE JS COLOR MIRROR.
 *
 * Raw hex may appear in exactly TWO files: src/app/globals.css and this one.
 * Nowhere else. Recharts/d3/inline-SVG take color as JS PROPS and can never
 * follow a CSS custom property, which is why a naive recolor of globals.css
 * leaves those charts stranded on the old palette.
 *
 * Use this static module — NOT getComputedStyle(document.documentElement),
 * which breaks under SSR and flashes the wrong color on hydration.
 *
 *   import { RISK, BRAND } from "@/lib/design/tokens";
 *   <Line stroke={BRAND.forest} />
 *   <Cell fill={RISK.high} />
 *   node.attr("fill", RISK.high)
 *
 * Values MUST stay in sync with the :root block in globals.css.
 *
 * NO CONSUMERS IN PILOT SCOPE: RiskDistributionChart drops recharts entirely and
 * gets its color from Tailwind utilities compiled off the @theme block. This
 * module exists now so (a) the pilot does not add a sixth drifting hex literal,
 * and (b) the three out-of-scope charts — ComplianceScore:14-16,
 * FleetTimeline:30, NetworkGraph:6-7 — have somewhere correct to migrate to.
 *
 * HONEST LIMIT: this makes hex live in two files, not one. The right end state
 * is generating this file from the CSS at build time — worth doing after the
 * pilot proves the palette, not before.
 */

export const RISK = {
  high: "#a24e00",
  medium: "#b45309",
  mediumTint: "#fff7ed",
  low: "#556070",
} as const;

export const BRAND = {
  forest: "#074d31",
  forest700: "#2a5f46",
  green: "#1aa165",
  mint: "#cbe5db",
  blue: "#0074d7",
} as const;

export const INK = {
  base: "#10231b",
  muted: "#556070",
  border: "#e2e6e4",
} as const;

/**
 * The card surface itself. d3 needs this for the node halo stroke — a ring
 * drawn in the CARD's colour (not a token from the ramp) so overlapping nodes
 * separate against the white card the graph sits in.
 */
export const SURFACE = {
  base: "#ffffff",
  sunken: "#f3f4f6",
} as const;
