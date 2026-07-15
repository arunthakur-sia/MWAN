/**
 * CONTRAST CORRECTION the brief did not flag: the primary button was
 * `bg-mwan-green text-white`. White on the accent green #1aa165 measures
 * 3.32:1 — it FAILS AA for normal text. Green cannot carry white text at any
 * size that matters.
 *
 * So the primary surface is FOREST (white on forest = 9.93), hover forest-700
 * (white on it = 7.43), and green survives as the FOCUS RING only — where
 * 3.32:1 clears the 3:1 non-text threshold.
 *
 * Restores `inline-flex items-center gap-2`, which OutcomeForm:90 had already
 * dropped. Replaces the 4 hand-copied strings at ScheduleInspectionButton:32,
 * RunPipelineButtons:35, RetrainButton:33, OutcomeForm:90.
 */
const BASE =
  "inline-flex items-center gap-2 rounded-control px-4 py-2 text-body font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS = {
  primary: "bg-forest text-white hover:bg-forest-700 active:bg-forest",
  secondary:
    "border border-border-strong bg-surface text-ink hover:bg-surface-sunken hover:border-forest active:bg-surface-sunken",
  /* ON THE CANVAS. `secondary` is a white-filled chip — correct on a light page,
     but on the dark canvas a white fill is the LOUDEST thing available and would
     silently re-promote the maintenance actions the design deliberately demoted.
     This variant keeps them quiet where they now live: mint on a translucent
     lift, no fill. Measured: mint on the white/5-over-canvas blend is 10.19:1.
     The focus ring is mint, NOT green: green is 2.99 on forest and fails the 3:1
     non-text bar, and this button sits on a dark surface. */
  canvas:
    "border border-white/20 bg-white/5 text-mint hover:bg-white/10 hover:text-white active:bg-white/[0.07] focus-visible:ring-mint focus-visible:ring-offset-transparent",
} as const;

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  variant?: "primary" | "secondary" | "canvas";
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
